#!/bin/bash

echo "🚀 Salon Reservation App - Deployment Preparation"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found!"
    echo "Please run: git init && git add . && git commit -m 'Initial commit'"
    exit 1
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No GitHub remote found!"
    echo "Please add your GitHub repository:"
    echo "git remote add origin https://github.com/yourusername/your-repo-name.git"
    exit 1
fi

# Check if code is pushed
if [ "$(git rev-list HEAD...origin/main --count 2>/dev/null)" != "0" ]; then
    echo "⚠️  Local changes not pushed to GitHub!"
    echo "Please push your changes:"
    echo "git add . && git commit -m 'Prepare for deployment' && git push origin main"
fi

echo ""
echo "✅ Prerequisites Check Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up MongoDB Atlas (free): https://www.mongodb.com/atlas"
echo "2. Deploy on Cyclic.sh (free): https://www.cyclic.sh"
echo "3. Follow the DEPLOYMENT_GUIDE.md for detailed instructions"
echo ""
echo "🎯 Quick Commands:"
echo "git add . && git commit -m 'Update for deployment' && git push origin main"
echo ""
echo "📖 Read DEPLOYMENT_GUIDE.md for complete instructions" 