# Deployment Checklist

## Pre-Deployment

### Security
- [ ] `ngrok.yml` is in `.gitignore` (contains auth token)
- [ ] No `.env` files are committed
- [ ] All sensitive data is excluded
- [ ] API keys and tokens are not in code

### Cleanup
- [ ] Removed `__pycache__/` directories
- [ ] Removed duplicate directories
- [ ] Removed test artifacts
- [ ] Cleaned up temporary files

### Documentation
- [ ] README.md is up to date
- [ ] All setup instructions are correct
- [ ] Example files provided (ngrok.yml.example, .env.example)

## Repository Structure

```
michackathondemo/
├── app/                    # Backend application
│   ├── __init__.py
│   ├── fallacy_detector.py
│   ├── models.py
│   └── speech_processor.py
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
├── tests/                  # Test files
├── main.py                 # Flask backend entry point
├── requirements.txt        # Python dependencies
├── Dockerfile              # Backend Docker image
├── docker-compose.yml      # Docker Compose configuration
├── env.example            # Environment variable template
├── ngrok.yml.example      # Ngrok config template
├── README.md              # Main documentation
└── *.bat/ps1              # Startup scripts
```

## Required Files

### Must be committed:
- Source code (`.py`, `.tsx`, `.ts`, `.css`)
- Configuration templates (`.example` files)
- Documentation (`.md` files)
- Dependency files (`requirements.txt`, `package.json`)
- Scripts (`install.bat`, `install.ps1`, `run.bat`, `run.ps1`)
- Docker configuration files (`Dockerfile`, `docker-compose.yml`)

### Must NOT be committed:
- `ngrok.yml` (contains auth token)
- `.env` files (may contain secrets)
- `__pycache__/` directories
- `node_modules/`
- Build artifacts

## Environment Setup

Users should run the installation script:

```batch
install.bat
```

Or manually:
1. Copy `env.example` to `.env` and configure
2. Copy `ngrok.yml.example` to `ngrok.yml` and add their auth token
3. Run `pip install -r requirements.txt`
4. Run `cd frontend && npm install`

## Quick Start

**Docker (Recommended)**:
```bash
docker-compose up -d
```

**Windows Scripts**:
```batch
run.bat
```

**With Ngrok**:
```batch
run-ngrok.bat
```

## Notes

- Flask backend runs on port 8000
- React frontend runs on port 8001
- Ngrok setup is optional but documented
- All scripts use relative paths where possible

