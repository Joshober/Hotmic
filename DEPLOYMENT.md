# Deployment Checklist

## Pre-Deployment

### ✅ Security
- [ ] `ngrok.yml` is in `.gitignore` (contains auth token)
- [ ] No `.env` files are committed
- [ ] All sensitive data is excluded
- [ ] API keys and tokens are not in code

### ✅ Cleanup
- [ ] Removed `__pycache__/` directories
- [ ] Removed duplicate directories
- [ ] Removed test artifacts
- [ ] Cleaned up temporary files

### ✅ Documentation
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
├── env.example            # Environment variable template
├── ngrok.yml.example        # Ngrok config template
├── README.md              # Main documentation
└── start-*.bat/ps1        # Startup scripts
```

## Required Files

### Must be committed:
- ✅ Source code (`.py`, `.tsx`, `.ts`, `.css`)
- ✅ Configuration templates (`.example` files)
- ✅ Documentation (`.md` files)
- ✅ Dependency files (`requirements.txt`, `package.json`)
- ✅ Scripts (`start-*.bat`, `start-*.ps1`)

### Must NOT be committed:
- ❌ `ngrok.yml` (contains auth token)
- ❌ `.env` files (may contain secrets)
- ❌ `__pycache__/` directories
- ❌ `node_modules/`
- ❌ Build artifacts

## Environment Setup

Users should:
1. Copy `env.example` to `.env` and configure
2. Copy `ngrok.yml.example` to `ngrok.yml` and add their auth token
3. Run `pip install -r requirements.txt`
4. Run `cd frontend && npm install`

## Quick Start

```bash
# Backend
python main.py

# Frontend (in separate terminal)
cd frontend
npm run dev

# Or use scripts
start-all.bat
```

## Notes

- Flask backend runs on port 8000
- React frontend runs on port 8001
- Ngrok setup is optional but documented
- All scripts use relative paths where possible

