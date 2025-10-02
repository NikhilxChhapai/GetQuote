# Royal Box Calculist 📦

A modern, responsive calculator application for various printing and packaging calculations including boxes, brochures, business cards, and paper bags.

## 🚀 Features

- **Box Calculator** - Calculate pricing for custom boxes
- **Brochure Calculator** - Pricing for brochure printing
- **Business Card Calculator** - Business card cost estimation
- **Paper Bag Calculator** - Paper bag pricing calculations
- **Modern UI** - Built with React, TypeScript, and Tailwind CSS
- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Works on all devices
- **PDF Export** - Export calculations as PDF

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: Radix UI, shadcn/ui
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PDF Generation**: jsPDF
- **Deployment**: Vercel

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd royal-box-calculist-39474-32924-62364
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:8080](http://localhost:8080) in your browser

## 📦 Deployment

This project is configured for automatic deployment with Vercel. Every push to the main branch will trigger a new deployment.

### Easy GitHub Push

Use the built-in deployment script:

```bash
# Method 1: Using npm script
npm run push "Your commit message"

# Method 2: Using node directly  
node deploy.js "Your commit message"

# Method 3: Manual git commands
git add .
git commit -m "Your commit message"
git push origin main
```

The deployment script automatically:
- ✅ Checks for sensitive files
- 📦 Stages all changes
- 💾 Commits with your message
- 🌐 Pushes to GitHub
- 🚀 Triggers Vercel deployment

## 🔒 Security

- All sensitive files are automatically excluded via `.gitignore`
- Environment variables template provided in `env.example`
- Deployment script prevents accidental sensitive file commits
- Public repository safe - no secrets exposed

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── Calculator.tsx  # Main calculator component
│   └── ...
├── data/               # Static data and configurations
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── pages/              # Page components
```

## 🎨 Customization

### Adding New Calculators
1. Create new component in `src/components/`
2. Add pricing logic in `src/data/`
3. Update main calculator component
4. Add navigation if needed

### Styling
- Modify `tailwind.config.ts` for theme customization
- Update CSS variables in `src/index.css`
- Use shadcn/ui components for consistency

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `npm run push "Add amazing feature"`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the console for errors
2. Ensure all dependencies are installed
3. Verify Node.js version compatibility
4. Check Vercel deployment logs

---

Made with ❤️ using React + TypeScript + Vite