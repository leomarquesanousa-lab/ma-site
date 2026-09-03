"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  async function handleLogout() {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetch("/api/logout", {
          method: "POST",
        });

      if (!response.ok) {
        throw new Error(
          "Não foi possível sair da conta.",
        );
      }

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error(error);

      alert(
        "Não foi possível sair da conta. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="ma-btn ma-btn-secondary"
      onClick={handleLogout}
      disabled={loading}
    >
      {loading
        ? "Saindo..."
        : "Sair da conta"}
    </button>
  );
}