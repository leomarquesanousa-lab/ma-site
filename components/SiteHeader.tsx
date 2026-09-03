"use client";

import { useState } from "react";

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });

      window.location.href = "/login";
    } catch (error) {
      console.error(
        "Erro ao sair:",
        error,
      );
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="site-header-top">
        <div className="ma-container site-header-top-inner">
          <span>
            Personalizados que contam histórias.
          </span>

          <a href="/#newsletter">
            Ganhe 10% na primeira compra
          </a>
        </div>
      </div>

      <div className="site-header-main">
        <div className="ma-container site-header-main-inner">
          <a
            href="/"
            className="site-brand"
            aria-label="M.A. Confecções e Brindes"
          >
            <img
              src="/logo-ma.jpg"
              alt="M.A. Confecções e Brindes"
            />

            <div>
              <strong>
                M.A.
              </strong>

              <span>
                Confecções e Brindes
              </span>
            </div>
          </a>

          <form
            className="site-search"
            onSubmit={(event) =>
              event.preventDefault()
            }
          >
            <input
              type="search"
              placeholder="O que você está procurando?"
              aria-label="Buscar produtos"
            />

            <button
              type="submit"
              aria-label="Buscar"
            >
              🔎
            </button>
          </form>

          <div className="site-header-actions">
            <a
              href="/minha-conta/favoritos"
              className="site-header-action"
              title="Favoritos"
            >
              <span>
                ♡
              </span>

              <small>
                Favoritos
              </small>
            </a>

            <a
              href="/minha-conta"
              className="site-header-action"
              title="Minha conta"
            >
              <span>
                👤
              </span>

              <small>
                Minha conta
              </small>
            </a>

            <a
              href="/carrinho"
              className="site-header-action cart-action"
              title="Carrinho"
            >
              <span>
                🛒
              </span>

              <small>
                Carrinho
              </small>

              <b>
                0
              </b>
            </a>

            <button
              type="button"
              className="mobile-menu-button"
              aria-label={
                menuOpen
                  ? "Fechar menu"
                  : "Abrir menu"
              }
              aria-expanded={menuOpen}
              onClick={() =>
                setMenuOpen(
                  (current) => !current,
                )
              }
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      <nav
        className={`site-nav ${
          menuOpen
            ? "site-nav-open"
            : ""
        }`}
      >
        <div className="ma-container site-nav-inner">
          <a
            href="/"
            className="nav-main-link"
            onClick={closeMenu}
          >
            Início
          </a>

          <div className="nav-group">
            <a
              href="/produtos"
              className="nav-main-link nav-dropdown-trigger"
              onClick={closeMenu}
            >
              Produtos
              <span className="nav-arrow">
                ▾
              </span>
            </a>

            <div className="nav-dropdown">
              <a
                href="/produtos"
                onClick={closeMenu}
              >
                Todos os produtos
              </a>

              <a
                href="/produtos/camisetas"
                onClick={closeMenu}
              >
                Camisetas
              </a>

              <a
                href="/produtos/canecas"
                onClick={closeMenu}
              >
                Canecas
              </a>

              <a
                href="/produtos/azulejos"
                onClick={closeMenu}
              >
                Azulejos
              </a>

              <a
                href="/produtos/brindes"
                onClick={closeMenu}
              >
                Brindes personalizados
              </a>

              <div className="nav-dropdown-divider" />

              <a
                href="/produtos/linha-baby"
                onClick={closeMenu}
              >
                Linha Baby
              </a>

              <a
                href="/produtos/linha-pet"
                onClick={closeMenu}
              >
                Linha Pet
              </a>

              <a
                href="/produtos/linha-torcedor"
                onClick={closeMenu}
              >
                Linha Torcedor
              </a>
            </div>
          </div>

          <div className="nav-group">
            <a
              href="/personalizados"
              className="nav-main-link nav-dropdown-trigger"
              onClick={closeMenu}
            >
              Personalizados
              <span className="nav-arrow">
                ▾
              </span>
            </a>

            <div className="nav-dropdown">
              <a
                href="/personalizados"
                onClick={closeMenu}
              >
                Todos os personalizados
              </a>

              <a
                href="/personalizados/camisetas"
                onClick={closeMenu}
              >
                Camisetas personalizadas
              </a>

              <a
                href="/personalizados/canecas"
                onClick={closeMenu}
              >
                Canecas personalizadas
              </a>

              <a
                href="/personalizados/azulejos"
                onClick={closeMenu}
              >
                Azulejos personalizados
              </a>

              <a
                href="/personalizados/brindes"
                onClick={closeMenu}
              >
                Brindes personalizados
              </a>
            </div>
          </div>

          <div className="nav-group">
            <a
              href="/uniformes"
              className="nav-main-link nav-dropdown-trigger"
              onClick={closeMenu}
            >
              Uniformes
              <span className="nav-arrow">
                ▾
              </span>
            </a>

            <div className="nav-dropdown">
              <a
                href="/uniformes"
                onClick={closeMenu}
              >
                Todos os uniformes
              </a>

              <a
                href="/uniformes/escolares"
                onClick={closeMenu}
              >
                Uniformes escolares
              </a>

              <a
                href="/uniformes/empresariais"
                onClick={closeMenu}
              >
                Uniformes empresariais
              </a>

              <a
                href="/orcamento"
                onClick={closeMenu}
              >
                Solicitar orçamento
              </a>
            </div>
          </div>

          <a
            href="/pronta-entrega"
            className="nav-main-link"
            onClick={closeMenu}
          >
            Pronta entrega
          </a>

          <a
            href="/ofertas"
            className="nav-main-link nav-offers-link"
            onClick={closeMenu}
          >
            Ofertas
          </a>

          <a
            href="https://app.maconfeccoes.com.br"
            target="_blank"
            rel="noreferrer"
            className="nav-main-link"
            onClick={closeMenu}
          >
            MA System
          </a>

          <a
            href="/orcamento"
            className="nav-main-link"
            onClick={closeMenu}
          >
            Orçamento
          </a>

          <div className="nav-group nav-account-group">
            <a
              href="/minha-conta"
              className="nav-main-link nav-dropdown-trigger"
              onClick={closeMenu}
            >
              Minha conta
              <span className="nav-arrow">
                ▾
              </span>
            </a>

            <div className="nav-dropdown nav-dropdown-right">
              <a
                href="/minha-conta"
                onClick={closeMenu}
              >
                Visão geral
              </a>

              <a
                href="/minha-conta/pedidos"
                onClick={closeMenu}
              >
                Meus pedidos
              </a>

              <a
                href="/minha-conta/personalizacoes"
                onClick={closeMenu}
              >
                Personalizações
              </a>

              <a
                href="/minha-conta/favoritos"
                onClick={closeMenu}
              >
                Favoritos
              </a>

              <a
                href="/minha-conta/enderecos"
                onClick={closeMenu}
              >
                Endereços
              </a>

              <a
                href="/minha-conta/dados"
                onClick={closeMenu}
              >
                Meus dados
              </a>

              <a
                href="/alterar-senha"
                onClick={closeMenu}
              >
                Alterar senha
              </a>

              <div className="nav-dropdown-divider" />

              <button
                type="button"
                className="nav-logout-button"
                onClick={handleLogout}
              >
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        .site-header {
          position: relative;
          z-index: 50;
          width: 100%;
          background:
            var(--ma-surface);
          border-bottom:
            1px solid
            var(--ma-border);
        }

        .site-header-top {
          background:
            var(--ma-surface-dark);
          color: #ffffff;
        }

        .site-header-top-inner {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content:
            space-between;
          gap: 18px;
          font-size: 11px;
        }

        .site-header-top a {
          color: #ffffff;
          font-weight: 700;
          text-decoration: none;
        }

        .site-header-main {
          background:
            rgba(
              255,
              255,
              255,
              0.96
            );
        }

        .site-header-main-inner {
          min-height: 86px;
          display: grid;
          grid-template-columns:
            auto
            minmax(
              220px,
              1fr
            )
            auto;
          align-items: center;
          gap: 30px;
        }

        .site-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: inherit;
          text-decoration: none;
        }

        .site-brand img {
          width: 52px;
          height: 52px;
          object-fit: cover;
          border-radius: 14px;
        }

        .site-brand div {
          display: flex;
          flex-direction: column;
        }

        .site-brand strong {
          color:
            var(--ma-wine);
          font-size: 23px;
          font-weight: 800;
        }

        .site-brand span {
          margin-top: 1px;
          color:
            var(--ma-text-muted);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .site-search {
          width: 100%;
          max-width: 620px;
          justify-self: center;
          display: flex;
          align-items: center;
          overflow: hidden;
          background:
            var(--ma-bg-soft);
          border:
            1px solid
            var(--ma-border-strong);
          border-radius:
            var(--ma-radius-md);
        }

        .site-search:focus-within {
          border-color:
            var(--ma-wine);
          box-shadow:
            0 0 0 4px
            rgba(
              120,
              24,
              52,
              0.06
            );
        }

        .site-search input {
          width: 100%;
          height: 46px;
          padding: 0 15px;
          border: 0;
          outline: none;
          background: transparent;
          color:
            var(--ma-text);
          font-size: 13px;
        }

        .site-search button {
          width: 48px;
          height: 46px;
          flex: 0 0 48px;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .site-header-actions {
          display: flex;
          align-items: center;
          justify-content:
            flex-end;
          gap: 7px;
        }

        .site-header-action {
          position: relative;
          min-width: 58px;
          min-height: 50px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border-radius: 12px;
          color:
            var(--ma-text);
          text-decoration: none;
          transition:
            background
            var(--ma-transition);
        }

        .site-header-action:hover {
          background:
            var(--ma-wine-light);
        }

        .site-header-action
          > span {
          font-size: 18px;
          line-height: 1;
        }

        .site-header-action small {
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .cart-action b {
          position: absolute;
          top: 2px;
          right: 7px;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border-radius: 999px;
          background:
            var(--ma-wine);
          color: #ffffff;
          font-size: 9px;
        }

        .mobile-menu-button {
          display: none;
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 12px;
          background:
            var(--ma-wine-light);
          color:
            var(--ma-wine);
          font-size: 19px;
          cursor: pointer;
        }

        .site-nav {
          position: relative;
          background:
            var(--ma-surface);
          border-top:
            1px solid
            var(--ma-border);
        }

        .site-nav-inner {
          min-height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
        }

        .nav-group {
          position: relative;
          display: flex;
          align-items: center;
          min-height: 45px;
        }

        .nav-main-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
          min-height: 45px;
          color:
            var(--ma-text-soft);
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition:
            color
            var(--ma-transition);
        }

        .nav-main-link:hover,
        .nav-group:hover
          > .nav-main-link,
        .nav-group:focus-within
          > .nav-main-link {
          color:
            var(--ma-wine);
        }

        .nav-main-link::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 0;
          height: 2px;
          transform:
            translateX(-50%);
          background:
            var(--ma-wine);
          transition:
            width
            var(--ma-transition);
        }

        .nav-main-link:hover::after,
        .nav-group:hover
          > .nav-main-link::after,
        .nav-group:focus-within
          > .nav-main-link::after {
          width: 100%;
        }

        .nav-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          line-height: 1;
          transition:
            transform
            var(--ma-transition);
        }

        .nav-group:hover
          .nav-arrow,
        .nav-group:focus-within
          .nav-arrow {
          transform:
            rotate(180deg);
        }

        .nav-offers-link {
          color:
            var(--ma-wine);
          font-weight: 800;
        }

        .nav-dropdown {
          position: absolute;
          top: calc(
            100% - 1px
          );
          left: -16px;
          z-index: 100;
          width: 230px;
          padding: 8px;
          visibility: hidden;
          opacity: 0;
          transform:
            translateY(-5px);
          pointer-events: none;
          background: #ffffff;
          border:
            1px solid
            var(--ma-border);
          border-radius:
            0 0
            var(--ma-radius-md)
            var(--ma-radius-md);
          box-shadow:
            var(--ma-shadow-md);
          transition:
            opacity
              var(--ma-transition),
            transform
              var(--ma-transition),
            visibility
              var(--ma-transition);
        }

        .nav-dropdown-right {
          left: auto;
          right: -16px;
        }

        .nav-group:hover
          .nav-dropdown,
        .nav-group:focus-within
          .nav-dropdown {
          visibility: visible;
          opacity: 1;
          transform:
            translateY(0);
          pointer-events: auto;
        }

        .nav-dropdown a {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          min-height: 38px;
          padding: 8px 11px;
          border-radius: 8px;
          color:
            var(--ma-text-soft);
          font-size: 12px;
          font-weight: 650;
          line-height: 1.25;
          text-decoration: none;
          white-space: normal;
          transition:
            background
              var(--ma-transition),
            color
              var(--ma-transition);
        }

        .nav-dropdown a:hover {
          background:
            var(--ma-wine-light);
          color:
            var(--ma-wine);
        }

        .nav-dropdown a::after {
          display: none;
        }

        .nav-dropdown-divider {
          height: 1px;
          margin: 6px 5px;
          background:
            var(--ma-border);
        }

        .nav-logout-button {
          width: 100%;
          min-height: 38px;
          display: flex;
          align-items: center;
          padding: 8px 11px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color:
            var(--ma-danger);
          font-size: 12px;
          font-weight: 750;
          text-align: left;
          cursor: pointer;
          transition:
            background
            var(--ma-transition);
        }

        .nav-logout-button:hover {
          background:
            rgba(
              190,
              38,
              51,
              0.07
            );
        }

        @media (
          max-width: 1100px
        ) {
          .site-nav-inner {
            gap: 17px;
          }

          .nav-main-link {
            font-size: 11px;
          }
        }

        @media (
          max-width: 980px
        ) {
          .site-header-main-inner {
            grid-template-columns:
              auto 1fr auto;
            gap: 16px;
          }

          .site-search {
            max-width: none;
          }

          .site-header-action small {
            display: none;
          }

          .site-header-action {
            min-width: 42px;
          }

          .site-nav-inner {
            gap: 12px;
          }

          .nav-main-link {
            font-size: 10px;
          }
        }

        @media (
          max-width: 760px
        ) {
          .site-header-top-inner {
            justify-content: center;
          }

          .site-header-top-inner
            span {
            display: none;
          }

          .site-header-main-inner {
            min-height: 74px;
            grid-template-columns:
              auto auto;
          }

          .site-search {
            grid-column:
              1 / -1;
            grid-row: 2;
            margin-bottom: 12px;
          }

          .site-header-actions {
            justify-self: end;
          }

          .site-header-action {
            display: none;
          }

          .mobile-menu-button {
            display: block;
          }

          .site-nav {
            display: none;
          }

          .site-nav-open {
            display: block;
          }

          .site-nav-inner {
            min-height: 0;
            padding:
              10px 0 18px;
            display: grid;
            grid-template-columns:
              1fr;
            align-items: stretch;
            justify-content: stretch;
            gap: 6px;
          }

          .nav-group {
            width: 100%;
            min-height: 0;
            display: block;
          }

          .nav-main-link {
            width: 100%;
            min-height: 42px;
            padding: 0 12px;
            justify-content:
              space-between;
            border-radius: 10px;
            background:
              var(--ma-bg-soft);
            font-size: 12px;
          }

          .nav-main-link::after {
            display: none;
          }

          .nav-arrow {
            display: none;
          }

          .nav-dropdown {
            position: static;
            width: 100%;
            margin-top: 4px;
            padding: 5px 0 5px 14px;
            visibility: visible;
            opacity: 1;
            transform: none;
            pointer-events: auto;
            background: transparent;
            border: 0;
            border-radius: 0;
            box-shadow: none;
          }

          .nav-dropdown a {
            min-height: 36px;
            padding: 7px 12px;
            border-left:
              2px solid
              var(--ma-border);
            border-radius:
              0 8px 8px 0;
            background: transparent;
            font-size: 11px;
          }

          .nav-dropdown-divider {
            margin:
              4px 8px 4px 0;
          }

          .nav-logout-button {
            min-height: 36px;
            margin-left: 0;
            padding: 7px 12px;
            border-left:
              2px solid
              var(--ma-border);
            border-radius:
              0 8px 8px 0;
            font-size: 11px;
          }
        }

        @media (
          max-width: 430px
        ) {
          .site-brand img {
            width: 46px;
            height: 46px;
          }

          .site-brand strong {
            font-size: 20px;
          }

          .site-brand span {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}