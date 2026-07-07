# Setup Forked Training Environment

A setup utility to enable workflows, set the PAT secret, and run the `init_fork.yml` workflow on forks of `frc-train`.

There are two ways to run this utility:

## Web Utility (The Easy Way)

Just visit [this URL](https://galaxia5987.github.io/frc-learn/frc-train) and follow the instructions there.

After completing all the steps there, you will have a working environment.

## Setup Script (The Hard Way)

If you really want to, you can also clone this repo and run the setup script locally.

```bash
git clone https://github.com/Galaxia5987/frc-train.git
cd frc-train/setup
npm install
node main.js --token ENTER_GITHUB_PAT_HERE
```

---

The web version does the same thing, just with your browser instead of node. Everything stays on your computer in both ways