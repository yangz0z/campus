# 맥미니 홈서버 셋업 가이드

## 1. 기본 환경 설치

```bash
# Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js, pnpm, Docker, cloudflared, webhook
brew install node@22
brew install pnpm
brew install --cask docker
brew install cloudflared
brew install webhook
```

## 2. 프로젝트 클론 및 환경변수

```bash
cd ~/study
git clone <레포 URL> campus
cd campus

# .env 파일 생성 (기존 맥북 .env 내용 복사)
vi .env
```

## 3. Cloudflare Tunnel 설정

```bash
# 로그인 (브라우저에서 도메인 선택)
cloudflared tunnel login

# 터널 생성
cloudflared tunnel create campus

# DNS 등록
cloudflared tunnel route dns campus camp-withus.com
cloudflared tunnel route dns campus api.camp-withus.com
cloudflared tunnel route dns campus deploy.camp-withus.com
cloudflared tunnel route dns campus logs.camp-withus.com
```

`~/.cloudflared/config.yml` 작성:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /Users/<맥미니유저>/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: camp-withus.com
    service: http://localhost:3000

  - hostname: api.camp-withus.com
    service: http://localhost:4000

  - hostname: deploy.camp-withus.com
    service: http://localhost:9000

  - hostname: logs.camp-withus.com
    service: http://localhost:3001

  - service: http_status:404
```

## 4. 배포 스크립트 생성

`~/deploy.sh`:

```bash
#!/bin/bash
cd ~/study/campus
git pull origin main
pnpm install --frozen-lockfile
pnpm build
docker compose --profile prod up --build -d
```

```bash
chmod +x ~/deploy.sh
```

## 5. Webhook 설정

`~/hooks.json`:

```json
[
  {
    "id": "deploy",
    "execute-command": "/Users/<맥미니유저>/deploy.sh",
    "command-working-directory": "/Users/<맥미니유저>/study/campus",
    "trigger-rule": {
      "match": {
        "type": "payload-hmac-sha256",
        "secret": "<GitHub Webhook에 설정한 시크릿>",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature-256"
        }
      }
    }
  }
]
```

## 6. 서비스 실행

순서대로 실행:

```bash
# 1) Docker 서비스 (앱 + 로그 시스템)
cd ~/study/campus
docker compose --profile prod up --build -d

# 2) Cloudflare Tunnel (백그라운드)
nohup cloudflared tunnel --loglevel info --logfile ~/.cloudflared/tunnel.log run campus > /dev/null 2>&1 &

# 3) Webhook 서버 (백그라운드)
nohup webhook -hooks ~/hooks.json -port 9000 -verbose > ~/webhook.log 2>&1 &
```

## 7. 실행 확인

```bash
# Docker 컨테이너 확인
docker compose --profile prod ps

# Cloudflare Tunnel 확인
curl https://camp-withus.com

# Webhook 확인
curl http://localhost:9000/hooks/deploy

# Grafana 확인
curl http://localhost:3001
```

## 8. 맥미니 재부팅 시 자동 실행

`~/start-server.sh`:

```bash
#!/bin/bash

# Docker 앱 실행
cd ~/study/campus
docker compose --profile prod up -d

# Cloudflare Tunnel
nohup cloudflared tunnel --loglevel info --logfile ~/.cloudflared/tunnel.log run campus > /dev/null 2>&1 &

# Webhook
nohup webhook -hooks ~/hooks.json -port 9000 -verbose > ~/webhook.log 2>&1 &
```

```bash
chmod +x ~/start-server.sh
```

### launchd 등록 (자동 실행)

`~/Library/LaunchAgents/com.campus.server.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.campus.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>/Users/<맥미니유저>/start-server.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/Users/<맥미니유저>/server.log</string>
    <key>StandardErrorPath</key>
    <string>/Users/<맥미니유저>/server-error.log</string>
</dict>
</plist>
```

```bash
launchctl load ~/Library/LaunchAgents/com.campus.server.plist
```
