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
- **📝 Product Submissions** – Submit products with images and custom URLs.
- **✏️ Edit or Remove Products** – Quickly update your product’s name, URL, or description. 
- **💬 Add Comments** – Engage with products through a dedicated comment section. 
- **👥 Admin Dashboard** – Comprehensive admin panel for content moderation.
- **🛡️ Role Management** – Add and manage admin users with special privileges.
- **⏳ Voting Cooldown** – Fair voting system with daily cooldown period.
- **🎨 Modern UI** – Sleek animations and responsive design with Tailwind CSS.
- **🔔 Toast Notifications** – Real-time feedback for user actions.
- **🖼️ Image Upload** – Support for product images with dimension validation.
- **🔒 Protected Routes** – Secure admin and authenticated user areas.
- **🗓️ Event Management** - Add or remove customized events.

---

## 🏗️ Project Structure  

```  
pulchowk-events/  
├── app/  
│   ├── actions/               # Business logic (e.g., voting, submissions)  
│   ├── api/                   # Next.js API routes  
│   ├── auth/                  # NextAuth authentication flows  
│   ├── components/  
│   │   ├── ui/               # Reusable UI components  
│   │   ├── admin/            # Admin dashboard components
│   │   └── forms/            # Form components
│   ├── lib/                   # Supabase client & utilities  
│   ├── product-hunt/          # Product Hunt showcase  
│   └── admin/                 # Admin dashboard (protected)  
├── types/                     # TypeScript definitions  
├── public/                    # Static assets  
└── config/                    # ESLint, Tailwind, etc.  
```  

---

## 🛠️ Tech Stack  

- **Frontend**: 
  - Next.js 14 with App Router
  - Tailwind CSS for styling
  - Framer Motion for animations
  - Sonner for toast notifications
  - Radix UI for accessible components

- **Backend**: 
  - Supabase for database & storage
  - Next.js API Routes
  - NextAuth for authentication

- **Development**: 
  - TypeScript
  - ESLint & Prettier
  - Husky for git hooks


---


## 📸 Screenshots

### Pulchowk Events First Demo Previews (5/10/2026)  

#### Admin Dashboard Demo Preview
![Demo Preview](https://s4.gifyu.com/images/bLJgM.gif)

#### Product Hunt Demo Preview
![Demo Preview](https://s4.gifyu.com/images/bLJgK.gif)

#### Login Demo Preview
![Demo Preview](https://s4.gifyu.com/images/bLJgN.gif)

---

## 🚀 Quick Start  

### 📋 Prerequisites  
- Node.js (v18+)  
- Supabase & Discord OAuth credentials  

### ⚙️ Setup  
1. **Clone the repo**:  
   ```bash  
   git clone https://github.com/pulchowk-events/website.git  
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

---

