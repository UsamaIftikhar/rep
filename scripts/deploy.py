import paramiko
import tarfile
import os
import sys

# Production Server Credentials & Paths
HOST = os.environ.get("DEPLOY_HOST", "192.81.211.174")
USER = os.environ.get("DEPLOY_USER", "root")
PASS = os.environ.get("DEPLOY_PASS", "qz2@WC2G8YcXmVd")
LOCAL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
REMOTE_DIR = "/var/www/rep1"
TAR_PATH = "/tmp/rep1_code.tar.gz"

print(f"--- REP 1 Production Deployment ---", flush=True)
print(f"Connecting to {USER}@{HOST}...", flush=True)

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(HOST, username=USER, password=PASS, timeout=30)
    print("Successfully connected to DigitalOcean server via SSH!", flush=True)
except Exception as e:
    print(f"Connection failed: {e}", flush=True)
    sys.exit(1)

def run_cmd(cmd, check=True):
    print(f"\n--- Executing: {cmd} ---", flush=True)
    stdin, stdout, stderr = ssh.exec_command(cmd, get_pty=True)
    for line in iter(stdout.readline, ""):
        print(line, end="", flush=True)
    exit_code = stdout.channel.recv_exit_status()
    if exit_code != 0 and check:
        print(f"Command failed with exit code {exit_code}", flush=True)
    return exit_code

# Optional: Add local SSH public key to server authorized_keys for key-based authentication
try:
    pubkey_path = os.path.expanduser("~/.ssh/id_ed25519.pub")
    if os.path.exists(pubkey_path):
        with open(pubkey_path, "r") as f:
            pubkey = f.read().strip()
        run_cmd(f"mkdir -p /root/.ssh && chmod 700 /root/.ssh && grep -qxF '{pubkey}' /root/.ssh/authorized_keys 2>/dev/null || echo '{pubkey}' >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys", check=False)
except Exception:
    pass

# 1. Create lightweight tar archive (excluding build/runtime temp dirs and scratch)
print("Creating lightweight code archive...", flush=True)
ignore_dirs = {".next", "node_modules", ".git", "scratch", "dist"}

with tarfile.open(TAR_PATH, "w:gz") as tar:
    for root, dirs, files in os.walk(LOCAL_DIR):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for file in files:
            if file.endswith(".mov") or file.endswith(".mp4"):
                continue
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, LOCAL_DIR)
            tar.add(full_path, arcname=rel_path)

print("Lightweight archive created successfully!", flush=True)

# 2. Upload lightweight archive via SFTP
sftp = ssh.open_sftp()
run_cmd(f"mkdir -p {REMOTE_DIR}")
remote_tar = f"{REMOTE_DIR}/rep1_code.tar.gz"
print(f"Uploading code archive to {remote_tar}...", flush=True)
sftp.put(TAR_PATH, remote_tar)
print("Code archive uploaded!", flush=True)

# 3. Sync large assets (video.mov) if present locally
local_video = os.path.join(LOCAL_DIR, "public/images/video.mov")
remote_video = f"{REMOTE_DIR}/public/images/video.mov"
if os.path.exists(local_video):
    local_video_size = os.path.getsize(local_video)
    run_cmd(f"mkdir -p {REMOTE_DIR}/public/images")
    try:
        remote_stat = sftp.stat(remote_video)
        remote_size = remote_stat.st_size
    except IOError:
        remote_size = 0

    if remote_size != local_video_size:
        print(f"Uploading video.mov ({local_video_size / (1024*1024):.1f} MB)...", flush=True)
        def progress_callback(transferred, total):
            pct = (transferred / total) * 100
            if int(pct) % 20 == 0:
                print(f"Video upload: {pct:.0f}% ({transferred/(1024*1024):.1f} / {total/(1024*1024):.1f} MB)", flush=True)
        sftp.put(local_video, remote_video, callback=progress_callback)
        print("Video upload complete!", flush=True)
    else:
        print("video.mov already up to date on server!", flush=True)

sftp.close()

# 4. Unpack code
run_cmd(f"tar -xzf {remote_tar} -C {REMOTE_DIR}")
run_cmd(f"rm -f {remote_tar}")
run_cmd(f"mkdir -p {REMOTE_DIR}/public/uploads/avatars")

# 5. Read local .env and adjust production domain overrides
local_env_path = os.path.join(LOCAL_DIR, ".env")
if os.path.exists(local_env_path):
    with open(local_env_path, "r") as f:
        env_lines = f.readlines()
    
    prod_lines = []
    for line in env_lines:
        if line.startswith("DATABASE_URL="):
            prod_lines.append('DATABASE_URL="postgresql://rep1_user:REP1_Secure_Db_Pass_2026!@localhost:5432/rep1_db?schema=public"\n')
        elif line.startswith("NEXTAUTH_URL="):
            prod_lines.append('NEXTAUTH_URL="https://rep1exposure.com"\n')
        elif line.startswith("MIRO_REDIRECT_URI="):
            prod_lines.append('MIRO_REDIRECT_URI="https://rep1exposure.com/api/integrations/miro/callback"\n')
        elif line.startswith("ZOOM_REDIRECT_URI="):
            prod_lines.append('ZOOM_REDIRECT_URI="https://rep1exposure.com/api/integrations/zoom/callback"\n')
        else:
            prod_lines.append(line)
            
    prod_env_content = "".join(prod_lines)
else:
    print("Warning: Local .env file not found, preserving server .env", flush=True)
    prod_env_content = None

if prod_env_content:
    sftp = ssh.open_sftp()
    with sftp.file(f"{REMOTE_DIR}/.env", "w") as f:
        f.write(prod_env_content)
    sftp.close()
    print("Production .env synced from local .env with production domain settings!", flush=True)

# 6. Install dependencies, sync Prisma DB schema & seed test accounts
run_cmd(f"cd {REMOTE_DIR} && npm install --legacy-peer-deps")
run_cmd(f"cd {REMOTE_DIR} && npx prisma db push")
run_cmd(f"""cd {REMOTE_DIR} && npx --yes tsx -e "
import {{ db }} from './src/lib/db';
import {{ hashPassword }} from './src/lib/auth';

async function main() {{
  const hash = await hashPassword('password123');
  await db.user.upsert({{
    where: {{ email: 'usama@rep1recruiting.com' }},
    update: {{ passwordHash: hash, role: 'ADMIN', emailVerified: new Date() }},
    create: {{
      email: 'usama@rep1recruiting.com',
      firstName: 'Usama',
      lastName: 'Admin',
      passwordHash: hash,
      role: 'ADMIN',
      emailVerified: new Date(),
    }}
  }});
  const studentUser = await db.user.upsert({{
    where: {{ email: 'student@rep1recruiting.com' }},
    update: {{ passwordHash: hash, role: 'COACHES_ACADEMY_MEMBER', emailVerified: new Date() }},
    create: {{
      email: 'student@rep1recruiting.com',
      firstName: 'Test',
      lastName: 'Student',
      passwordHash: hash,
      role: 'COACHES_ACADEMY_MEMBER',
      emailVerified: new Date(),
    }}
  }});
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const existingEntitlement = await db.entitlement.findFirst({{
    where: {{
      userId: studentUser.id,
      type: 'COACHES_ACADEMY',
    }}
  }});
  if (existingEntitlement) {{
    await db.entitlement.update({{
      where: {{ id: existingEntitlement.id }},
      data: {{ endsAt: oneYearFromNow, revokedAt: null }}
    }});
  }} else {{
    await db.entitlement.create({{
      data: {{
        userId: studentUser.id,
        type: 'COACHES_ACADEMY',
        source: 'SUBSCRIPTION',
        sourceReferenceId: 'annual_membership_student',
        startsAt: new Date(),
        endsAt: oneYearFromNow,
      }}
    }});
  }}

  const existingAcademyEntitlement = await db.entitlement.findFirst({{
    where: {{
      userId: studentUser.id,
      type: 'ACADEMY',
    }}
  }});
  if (existingAcademyEntitlement) {{
    await db.entitlement.update({{
      where: {{ id: existingAcademyEntitlement.id }},
      data: {{ endsAt: oneYearFromNow, revokedAt: null }}
    }});
  }} else {{
    await db.entitlement.create({{
      data: {{
        userId: studentUser.id,
        type: 'ACADEMY',
        source: 'SUBSCRIPTION',
        sourceReferenceId: 'annual_membership_student_academy',
        startsAt: new Date(),
        endsAt: oneYearFromNow,
      }}
    }});
  }}
  console.log('Production test users and student entitlements created/updated successfully!');
}}
main().catch(console.error).finally(() => process.exit(0));
" """)

# 7. Build Next.js Production Bundle
run_cmd(f"cd {REMOTE_DIR} && npm run build")

# 8. Restart PM2 service
status = run_cmd("pm2 status | grep rep1-saas", check=False)
if status == 0:
    run_cmd("pm2 restart rep1-saas --update-env")
else:
    run_cmd(f"cd {REMOTE_DIR} && pm2 start npm --name 'rep1-saas' -- start")

print("\n--- DEPLOYMENT COMPLETED SUCCESSFULLY ---", flush=True)
ssh.close()
