import { db } from "@/lib/db";
import { SectionTitle } from "@/components/section-title";

export default async function ServicesPage() {
  const services = await db.productService.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });

  return (
    <div className="page-shell">
      <div className="container">
        <SectionTitle
          eyebrow="Services"
          title="Commercial and media services"
          subtitle="Database-backed product and services content ready for admin editing and public publishing."
        />
        <div className="grid-3">
          {services.map((service) => (
            <div className="card" key={service.id}>
              {service.image ? <img src={service.image} alt={service.title} style={{ borderRadius: 18, height: 220, objectFit: "cover", marginBottom: 14 }} /> : null}
              <div className="card-title">{service.title}</div>
              <div className="muted">{service.priceLabel || "Custom quotation"}</div>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
