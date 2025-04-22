# 🏰 Pulchowk Events  

**Discover & share events across Nepal's educational institutions!**  

Pulchowk Events is a dynamic platform for students with more than 1000 members to explore events, showcase projects in **Product Hunt**, and engage with the community. Built with Next.js, Supabase, and NextAuth.  

<p align="center">  
  <img src="https://s6.gifyu.com/images/bpq2A.gif" alt="Pulchowk Events Banner" width="700">  
</p>  

---

## ✨ Key Features  

- **🔐 Discord OAuth Login** – Secure authentication via NextAuth.  
- **🚀 Product Hunt** – Showcase and vote for student projects.  
- **🛠️ Admin Panel** – Manage users and products with role-based access.  
- **⏳ Voting Cooldown** – Users can vote **once per day** per project.  
- **🌐 Responsive UI** – Tailwind CSS for sleek, mobile-friendly design.  

---

## 🏗️ Project Structure  

```  
pulchowk-events/  
├── app/  
│   ├── actions/               # Business logic (e.g., voting)  
│   ├── api/                   # Next.js API routes  
│   ├── auth/                  # NextAuth authentication flows  
│   ├── components/            # Reusable UI components  
│   ├── lib/                   # Supabase client & utilities  
│   ├── product-hunt/          # Product Hunt showcase  
│   ├── admin/                 # Admin dashboard (protected)  
│   └── ...  
├── types/                     # TypeScript definitions  
├── public/                    # Static assets  
└── config/                    # ESLint, Tailwind, etc.  
```  

---

## 🚀 Quick Start  

### 📋 Prerequisites  
- Node.js (v18+)  
- Supabase & Discord OAuth credentials  

### ⚙️ Setup  
1. **Clone the repo**:  
   ```bash  
   git clone https://github.com/sashminea/pulchowk-events.git  
   cd pulchowk-events  
   ```  

2. **Install dependencies**:  
   ```bash  
   npm install  # or yarn  
   ```  

3. **Configure `.env.local`**:  
   ```bash  
   NEXT_PUBLIC_SUPABASE_URL=your_url  
   DISCORD_CLIENT_ID=your_id  
   NEXTAUTH_SECRET=your_secret  
   ```  

4. **Run dev server**:  
   ```bash  
   npm run dev  
   ```  

---

## 🛠️ Tech Stack  

- Frontend: Next.js, Tailwind CSS
- Backend: Supabase, Next.js API Routes

---

## 🤝 How to Contribute  

1. **Fork** the repository.  
2. Create a **feature branch**:  
   ```bash  
   git checkout -b feat/your-feature  
   ```  
3. Commit changes & **push**:  
   ```bash  
   git commit -m "Add: New voting animation"  
   git push origin feat/your-feature  
   ```  
4. Open a **Pull Request**!  

---

## 🙏 Acknowledgments  

- **Next.js Team** – For an amazing React framework.  
- **Supabase** – Open-source Firebase alternative.  
- **Discord** – Easy OAuth integration.  
- **Tailwind CSS** – Rapid UI development.  
