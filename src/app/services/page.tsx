import { getContentMap, getProductServices } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function ServicesPage() {
  const [contentMap, services] = await Promise.all([getContentMap(), getProductServices()]);
  const intro = contentMap['services.intro'];

  return (
    <main className="section">
      <div className="container">
        <div className="section-kicker">{intro.subtitle}</div>
        <h1 className="section-title">{intro.title}</h1>
        <p className="section-copy" style={{ maxWidth: 840 }}>{intro.body}</p>
      </div>

      <div className="container" style={{ marginTop: 28 }}>
        <div className="card-grid grid-2">
          {services.map((service: any) => (
            <article className="card" key={service.id}>
              <div className="section-kicker">{service.category}</div>
              <h2 style={{ marginTop: 0 }}>{service.name}</h2>
              <p className="section-copy">{service.description}</p>
              {service.priceLabel ? <div className="helper" style={{ marginBottom: 12 }}>{service.priceLabel}</div> : null}
              <ul className="list-clean">
                {String(service.features || '')
                  .split('\n')
                  .filter(Boolean)
                  .map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
