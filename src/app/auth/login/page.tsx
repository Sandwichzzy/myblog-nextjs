import { Metadata } from "next";
import LoginForm from "@/app/auth/login/LoginForm";

export const metadata: Metadata = {
  title: "登录 - 我的博客",
  description: "登录以发表评论和管理内容",
};

export default function LoginPage() {
  return <LoginForm />;
}
