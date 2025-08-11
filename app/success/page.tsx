"use client";

import Link from "next/link";

export default function OrderSuccessPage() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="green"
          style={{ width: 64, height: 64, marginBottom: "1rem" }}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>

        <h1 style={styles.title}>Your Order Has Been Placed!</h1>
        <p style={styles.subtitle}>
          Thank you for shopping with us. You’ll receive a confirmation email
          shortly.
        </p>

        <div style={{ marginTop: "1.5rem" }}>
          <Link href="/" style={styles.button}>
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#f9fafb",
    padding: "1rem",
  },
  card: {
    background: "white",
    padding: "2rem",
    borderRadius: "1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: 500,
    width: "100%",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#4b5563",
  },
  button: {
    display: "inline-block",
    background: "#2563eb",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    textDecoration: "none",
    fontWeight: 500,
  },
};
