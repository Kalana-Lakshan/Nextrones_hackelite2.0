# Welcome to Skillora

## Project info

## How can I edit this code?

There are several ways of editing your application.

### Use your preferred IDE

If you want to work locally using your own IDE, you can clone this repo and push changes.  
The only requirement is having Node.js & npm installed – [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# 1-Clone the repository from GitHub to your local machine
git clone https://github.com/Kalana-Lakshan/Nextrones_hackelite2.0.git

# 2-Go into the project folder
cd Nextrones_hackelite2.0

# 3-Install the project’s base dependencies from package.json
npm install

# 4-saves your changes
git stash

# 5-(Only if you want branch3) Switch to the branch3 branch
git checkout branch3

# 6-Install any missing packages not in the repo (Supabase helpers + Octokit)
npm install @supabase/auth-helpers-react @octokit/rest

# 7-Start the development server (Vite)
npm run dev

```

### Edit a file directly in GitHub

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

### Use GitHub Codespaces

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Open the project dashboard and click on **Share → Publish**.

## Can I connect a custom domain to this project?

Yes, you can!

To connect a domain, navigate to **Project → Settings → Domains** and click **Connect Domain**.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
