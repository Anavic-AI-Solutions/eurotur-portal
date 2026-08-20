import { Head } from '@inertiajs/react';
import { ImageSlot } from '@/components/portal/image-slot';

const RED = '#E30613';
const GOLD = '#b8933f';

type Category = {
    num: string;
    title: string;
    desc: string;
    placeholder: string;
    image: string;
    href: string;
};

const CATEGORIES: Category[] = [
    {
        num: '01',
        title: 'Creatividad & Contenido',
        desc: 'Piezas, campañas y material creativo.',
        placeholder: 'Creatividad y Contenido',
        image: '/img/portal/qrated/creatividad.jpg',
        href: 'https://drive.google.com/drive/folders/1clUYwl9z9tG0RRhI-A5zgZZ0tBN7Xa8L',
    },
    {
        num: '02',
        title: 'Herramientas',
        desc: 'Recursos y utilidades del equipo.',
        placeholder: 'Herramientas',
        image: '/img/portal/qrated/herramientas.jpg',
        href: 'https://drive.google.com/drive/folders/1h9pS_VFwaJtqItldu1P7_Hjft027Tmx2',
    },
    {
        num: '03',
        title: 'Proveedores Especiales',
        desc: 'Curaduría premium · MICE y lujo.',
        placeholder: 'Proveedores Especiales',
        image: '/img/portal/qrated/proveedores.jpg',
        href: 'https://drive.google.com/drive/folders/1SIoqHSXdA4XTZEmHP4gBYy8QKgIC25Yq',
    },
];

export default function Qrated() {
    return (
        <>
            <Head title="Qrated" />

            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '40px',
                        marginBottom: '22px',
                    }}
                >
                    <div style={{ maxWidth: '620px' }}>
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '10px',
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                color: '#666',
                                marginBottom: '12px',
                            }}
                        >
                            sello premium — by eurotur
                        </div>
                        <h1
                            style={{
                                fontFamily: "'Anton', sans-serif",
                                fontWeight: 400,
                                fontSize: 'clamp(64px,9vw,132px)',
                                lineHeight: 0.84,
                                margin: 0,
                                letterSpacing: '-0.005em',
                                color: GOLD,
                            }}
                        >
                            Qrated
                            <span style={{ color: RED }}>.</span>
                        </h1>
                        <p
                            style={{
                                maxWidth: '500px',
                                margin: '16px 0 0',
                                fontSize: '14px',
                                lineHeight: 1.5,
                                fontWeight: 500,
                                color: '#111',
                            }}
                        >
                            El sello premium de Eurotur: curaduría de
                            proveedores especiales, herramientas y contenido
                            creativo para experiencias de alta gama y MICE.
                        </p>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(80px,10vw,140px)',
                            lineHeight: 0.72,
                        }}
                    >
                        08
                    </div>
                </div>

                <div
                    style={{
                        height: '3px',
                        background: 'linear-gradient(90deg,#e2c384,#8a6a24)',
                        marginBottom: '26px',
                    }}
                />

                <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeQ5QQyS8NMrdeIWoQKCcKlx7UdZt3ziV4L8Hg9NwmZThv1DQ/viewform"
                    target="_blank"
                    rel="noreferrer"
                    className="qrated-cta"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        textDecoration: 'none',
                        background: RED,
                        color: '#fff',
                        padding: '16px 22px',
                        marginBottom: '32px',
                        transition: 'background .12s,transform .12s',
                    }}
                >
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '12px',
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '10px',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                opacity: 0.85,
                            }}
                        >
                            destacado
                        </span>
                        <span
                            style={{
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 800,
                                fontSize: '19px',
                                letterSpacing: '-0.01em',
                            }}
                        >
                            Nuevo Proveedor MICE
                        </span>
                    </span>
                    <span
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '16px',
                        }}
                    >
                        ↗
                    </span>
                </a>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        justifyContent: 'space-between',
                        borderBottom: '3px solid #000',
                        paddingBottom: '10px',
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '19px',
                            letterSpacing: '-0.01em',
                        }}
                    >
                        Categorías
                        <span style={{ color: RED }}>—</span>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#999',
                        }}
                    >
                        curaduría eurotur
                    </div>
                </div>
                <div
                    id="qrated-cats"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3,1fr)',
                        gap: 0,
                        borderLeft: '1px solid #000',
                    }}
                >
                    {CATEGORIES.map((cat) => (
                        <a
                            key={cat.num}
                            href={cat.href}
                            target="_blank"
                            rel="noreferrer"
                            className="qrated-cat"
                            style={{
                                borderRight: '1px solid #000',
                                borderBottom: '1px solid #000',
                                display: 'flex',
                                flexDirection: 'column',
                                textDecoration: 'none',
                                cursor: 'pointer',
                                transition:
                                    'background .12s,color .12s,transform .14s',
                            }}
                        >
                            <div
                                style={{
                                    position: 'relative',
                                    height: '210px',
                                    borderBottom: '1px solid #000',
                                }}
                            >
                                <ImageSlot
                                    src={cat.image}
                                    alt={cat.title}
                                    placeholder={cat.placeholder}
                                    grayscale
                                />
                            </div>
                            <div style={{ padding: '14px 16px 18px' }}>
                                <div
                                    className="qrated-cat-num"
                                    style={{
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '10px',
                                        letterSpacing: '0.08em',
                                    }}
                                >
                                    {cat.num}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '17px',
                                        letterSpacing: '-0.01em',
                                        marginTop: '3px',
                                    }}
                                >
                                    {cat.title}
                                </div>
                                <div
                                    className="qrated-cat-desc"
                                    style={{
                                        fontSize: '12px',
                                        lineHeight: 1.4,
                                        marginTop: '5px',
                                    }}
                                >
                                    {cat.desc}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                <div
                    style={{
                        marginTop: '34px',
                        borderTop: '1px solid #000',
                        paddingTop: '14px',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#666',
                    }}
                >
                    mantiene— Qrated · en desarrollo
                </div>
            </section>
        </>
    );
}

Qrated.layout = { active: 'qrated', label: 'Qrated—' };
