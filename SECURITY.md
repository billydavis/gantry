# Security

This app is designed to run as a personal, single-user, self-hosted service on a local Docker host. It is not intended to be exposed to the public internet. This document covers the network exposure model, container hardening basics, and database backup/restore.

---

## 1. Network Exposure

### Principle: expose only one port

Only the frontend (or a reverse proxy in front of it, if one is added later) should be reachable from outside the Docker network. Everything else stays internal.

```
Host machine
   │
   │  (single published port, e.g. 8080)
   ▼
[ PWA / reverse proxy container ]  ← only container with a published port
   │
   ├── ASP.NET API container   (internal only, no published port)
   └── PostgreSQL container    (internal only, no published port)
```

In `docker-compose.yml`, this means:

- The frontend service has a `ports:` mapping (e.g. `"8080:80"`).
- The API and PostgreSQL services have **no** `ports:` entry at all. They're still reachable by other containers on the same Docker Compose network via their service name (e.g. `http://api:5000`, `postgres:5432`), but not from the host or outside network.

```yaml
services:
  frontend:
    ports:
      - "8080:80"

  api:
    # no ports: — reachable only as "api" from other containers
    expose:
      - "5000"

  postgres:
    # no ports: — reachable only as "postgres" from other containers
    expose:
      - "5432"
```

`expose` documents the internal port for readability but doesn't publish it to the host, `ports` does. Only use `ports` on the one service that genuinely needs to be reachable from your browser.

### If the API needs to be called directly from the browser

If the React app calls the API directly (rather than the API being proxied behind the same origin as the frontend), you have two options:

1. **Preferred:** Put a lightweight reverse proxy (e.g. Caddy, nginx, or YARP) in front of both the static frontend and the API, published on the single port, and route `/api/*` to the API container internally. This keeps the "one port" model intact and avoids CORS entirely since everything is same-origin.
2. Publish a second port for the API. This works, but it's a second thing to firewall and think about, so option 1 is worth the small extra setup.

### Local network access

If you want to reach the dashboard from other devices on your home or office network (phone, tablet), that's just a matter of using the host machine's LAN IP instead of `localhost`, no extra ports needed. Be aware this also means anyone else on that network segment can reach it, since v1 has no authentication (see `PROJECT_SPEC.md`). Keep this in mind especially on shared or corporate networks.

### Do not expose this to the public internet in v1

Since v1 has no authentication, this should stay on a trusted local or home network only. If remote access is ever wanted, that should wait for the authentication work already listed as a future enhancement, and ideally sit behind something like a VPN (Tailscale, WireGuard) rather than a port forward on a router.

---

## 2. Container Hardening Basics

A few low-effort things worth doing regardless of exposure:

- **Don't run containers as root** where avoidable. The official PostgreSQL image and most ASP.NET base images support running as a non-root user, or you can set `USER` in your Dockerfile.
- **Pin image versions** (e.g. `postgres:16`, not `postgres:latest`) so backups and behavior stay predictable across rebuilds.
- **Use Docker secrets or an env file excluded from git** for the PostgreSQL password and any connection strings, never commit them.
- **Keep the Postgres data volume named and persistent** (see below), rather than relying on an anonymous volume that's easy to accidentally delete.
- **Restart policy:** `restart: unless-stopped` on all services so the stack comes back after a host reboot without you needing to remember to start it.

---

## 3. Database Backups

### Data volume

Make sure PostgreSQL's data directory is a named, persistent volume, not the container's writable layer:

```yaml
services:
  postgres:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

This means the data survives `docker compose down` and container recreation. It only disappears if the named volume itself is explicitly removed (`docker compose down -v`, or `docker volume rm`).

### Manual backup with pg_dump

The simplest, most portable backup is a plain SQL dump, taken from inside the running container and copied out to the host:

```bash
docker compose exec postgres pg_dump -U <db_user> -d <db_name> -F c -f /tmp/backup.dump
docker cp <postgres_container_name>:/tmp/backup.dump ./backups/backup_$(date +%Y%m%d_%H%M%S).dump
```

- `-F c` uses PostgreSQL's custom compressed format, which is smaller than plain SQL and restores with `pg_restore`.
- If you'd rather have a plain, human-readable `.sql` file (easier to skim or diff, but larger), drop `-F c -f /tmp/backup.dump` and instead redirect to a `.sql` file:

```bash
docker compose exec -T postgres pg_dump -U <db_user> -d <db_name> > ./backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

The `-T` flag disables pseudo-TTY allocation so the piped output isn't corrupted.

### Restoring

From a custom-format dump:

```bash
docker cp ./backups/backup_20260726_090000.dump <postgres_container_name>:/tmp/restore.dump
docker compose exec postgres pg_restore -U <db_user> -d <db_name> --clean --if-exists /tmp/restore.dump
```

From a plain `.sql` dump:

```bash
docker compose exec -T postgres psql -U <db_user> -d <db_name> < ./backups/backup_20260726_090000.sql
```

### Automating backups

A small script, run via a host cron job (or a dedicated lightweight backup sidecar container), covers this without adding much complexity:

```bash
#!/bin/bash
# backup.sh
set -e
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

docker compose exec -T postgres pg_dump -U <db_user> -d <db_name> -F c > "$BACKUP_DIR/backup_$TIMESTAMP.dump"

# keep the last 14 backups, delete older ones
ls -1t "$BACKUP_DIR"/backup_*.dump | tail -n +15 | xargs -r rm --
```

Add this to a host crontab, e.g. nightly at 2am:

```
0 2 * * * /path/to/backup.sh >> /path/to/backup.log 2>&1
```

### Getting backups off the host entirely

Since this is meant to protect against more than just "the container broke," it's worth periodically copying the `backups/` folder somewhere off the Docker host too, an external drive, a NAS, or a personal cloud storage folder synced from the host. The `docker cp` step above already gets the dump file out of the container and onto host disk; getting it off that one machine is the other half of an actual backup strategy.

### Pulling the raw data directory out (last resort)

Copying the named volume's raw files is possible but not recommended as your primary backup method (`pg_dump`/`pg_restore` is safer and portable across Postgres versions). If ever needed:

```bash
docker run --rm -v pgdata:/volume -v $(pwd)/backups:/backup alpine \
  tar czf /backup/pgdata_$(date +%Y%m%d_%H%M%S).tar.gz -C /volume .
```

This is mainly useful for a full disaster-recovery snapshot, not routine backups.

---

## 4. Summary Checklist

- [ ] Only the frontend (or reverse proxy) has a published port in `docker-compose.yml`
- [ ] API and PostgreSQL use `expose`, not `ports`
- [ ] PostgreSQL data lives on a named volume, not an anonymous one
- [ ] Secrets/passwords live in a gitignored `.env` file, not committed or hardcoded
- [ ] `restart: unless-stopped` set on all services
- [ ] A backup script runs on a schedule (cron) and dumps to host disk
- [ ] Backups are periodically copied off the host machine
- [ ] App stays on a trusted local/home network only until authentication is added
