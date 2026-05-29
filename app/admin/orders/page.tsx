import dynamic from "next/dynamic";
import { prisma } from "../../../lib/prisma";
import ClearOrdersButton from "./ClearOrdersButton";
const Header = dynamic(() => import("../../../Components/Header"), { ssr: false });

async function getOrders() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return orders;
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  const styles: { [k: string]: React.CSSProperties } = {
    main: { minHeight: "100vh", background: "#fff" },
    container: { maxWidth: 1200, margin: "0 auto", padding: "48px 24px" },
    title: { fontSize: 36, fontWeight: 800, marginBottom: 32, color: "#0f4ea8" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: 24 },
    th: { textAlign: "left", padding: 12, background: "#f5f8ff", color: "#0f4ea8", fontWeight: 700, fontSize: 14, borderBottom: "2px solid #e5e7eb" },
    td: { padding: 12, fontSize: 14, borderBottom: "1px solid #eee" },
    statusBadge: { display: "inline-block", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700 },
    pending: { background: "#fef3c7", color: "#92400e" },
    confirmed: { background: "#dbeafe", color: "#1e40af" },
    shipped: { background: "#e0e7ff", color: "#4338ca" },
    delivered: { background: "#dcfce7", color: "#166534" },
    cancelled: { background: "#fee2e2", color: "#b91c1c" },
    viewBtn: { background: "#0f4ea8", color: "#fff", border: "none", borderRadius: 6, padding: "6px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", textDecoration: "none" },
    empty: { textAlign: "center", padding: 48, color: "#666", fontSize: 18 },
  };

  const getStatusStyle = (status: string) => {
    const map: Record<string, React.CSSProperties> = {
      pending: styles.pending,
      confirmed: styles.confirmed,
      shipped: styles.shipped,
      delivered: styles.delivered,
      cancelled: styles.cancelled,
    };
    return map[status] || styles.pending;
  };

  return (
    <main style={styles.main}>
      <Header />
      <div style={styles.container}>
        <h1 style={{ ...styles.title, marginTop: '85px' }}>Porositë</h1>
        {orders.length > 0 ? <ClearOrdersButton /> : null}
        {orders.length === 0 ? (
          <div style={styles.empty}>Nuk ka porosi akoma.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Numri</th>
                <th style={styles.th}>Klienti</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Totali</th>
                <th style={styles.th}>Statusi</th>
                <th style={styles.th}>Data</th>
                <th style={styles.th}>Veprime</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order.id}>
                  <td style={styles.td}>{order.orderNumber}</td>
                  <td style={styles.td}>{order.customer.name}</td>
                  <td style={styles.td}>{order.customer.email}</td>
                  <td style={{ ...styles.td, fontWeight: 600 }}>€{order.total.toFixed(2)}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusBadge, ...getStatusStyle(order.status) }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(order.createdAt).toLocaleDateString("sq-AL")}
                  </td>
                  <td style={styles.td}>
                    <a href={`/admin/orders/${order.id}`} style={styles.viewBtn}>
                      Shiko
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
