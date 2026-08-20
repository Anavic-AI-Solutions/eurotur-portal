import { Head } from '@inertiajs/react';
import { ImageSlot } from '@/components/portal/image-slot';

const RED = '#E30613';

type Valor = { n: string; t: string; d: string };

const VALORES: Valor[] = [
    {
        n: '01',
        t: 'Integridad y Compromiso',
        d: 'Seguridad, responsabilidad e integridad en todas nuestras operaciones, construyendo confianza.',
    },
    {
        n: '02',
        t: 'Vínculo Humano',
        d: 'Ponemos el vínculo humano al nivel de las metas empresariales, con relaciones auténticas.',
    },
    {
        n: '03',
        t: 'Creatividad e Innovación',
        d: 'Fomentamos la curiosidad y la mejora constante de cada experiencia de viaje.',
    },
    {
        n: '04',
        t: 'Crecimiento',
        d: 'Ambiente inclusivo donde todas las personas puedan desarrollarse respetando la pluralidad.',
    },
    {
        n: '05',
        t: 'Resultados y Eficiencia',
        d: 'Orientación a resultados medibles y valor agregado para un crecimiento sostenible.',
    },
];

export default function Institucional() {
    return (
        <>
            <Head title="Institucional" />

            <section>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '40px',
                        marginBottom: '28px',
                    }}
                >
                    <div>
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
                            acerca de eurotur — desde 1954
                        </div>
                        <h1
                            style={{
                                fontFamily: "'Anton', sans-serif",
                                fontWeight: 400,
                                fontSize: 'clamp(64px,9vw,132px)',
                                lineHeight: 0.84,
                                margin: 0,
                                letterSpacing: '-0.005em',
                            }}
                        >
                            70 años
                            <br />
                            creando viajes
                            <span style={{ color: RED }}>.</span>
                        </h1>
                    </div>
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(96px,13vw,176px)',
                            lineHeight: 0.72,
                        }}
                    >
                        01
                    </div>
                </div>

                <div
                    style={{
                        position: 'relative',
                        height: '340px',
                        borderTop: '3px solid #000',
                        borderBottom: '1px solid #000',
                        marginBottom: '34px',
                    }}
                >
                    <ImageSlot
                        src="/img/portal/institucional/ushuaia-02.jpg"
                        alt="Patagonia — paisaje de montañas"
                        placeholder="Imagen a sangre — Glaciar Perito Moreno / Patagonia (blanco y negro)"
                        grayscale
                    />
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1.55fr 1fr',
                        gap: '56px',
                    }}
                >
                    <div>
                        <p
                            style={{
                                margin: 0,
                                fontSize: '17px',
                                lineHeight: 1.6,
                                color: '#111',
                                fontWeight: 500,
                            }}
                        >
                            <span
                                style={{
                                    float: 'left',
                                    fontFamily: "'Anton', sans-serif",
                                    fontSize: '98px',
                                    lineHeight: 0.72,
                                    margin: '6px 14px -6px 0',
                                    color: RED,
                                }}
                            >
                                E
                            </span>
                            n Eurotur llevamos creando viajes inolvidables desde
                            1954 como uno de los principales DMC receptivos para
                            Argentina y Sudamérica, con nuestra sede central en
                            Buenos Aires y sucursales en la Patagonia —El
                            Calafate y Ushuaia— y el Noroeste, en la ciudad de
                            Salta, reabierta en 2025. También contamos con una
                            empresa de transporte de vehículos de lujo y vans
                            pequeñas.
                        </p>
                        <p
                            style={{
                                margin: '20px 0 0',
                                fontSize: '15px',
                                lineHeight: 1.65,
                                color: '#222',
                            }}
                        >
                            Durante casi siete décadas hemos ofrecido una amplia
                            variedad de productos, desde viajes de lujo hasta
                            expediciones, desde lo tradicional hasta lo no
                            convencional. Nuestros expertos se dividen en
                            equipos especializados —Tailor Made, FITs, Grupos,
                            MICE— y trabajan con pasión para diseñar recorridos
                            innovadores.
                        </p>
                        <p
                            style={{
                                margin: '20px 0 0',
                                fontFamily: "'Archivo', sans-serif",
                                fontWeight: 800,
                                fontSize: '18px',
                                lineHeight: 1.35,
                                letterSpacing: '-0.01em',
                            }}
                        >
                            «Conocimiento local, trabajo en equipo y formación
                            permanente» son nuestras marcas registradas.
                        </p>
                        <p
                            style={{
                                margin: '16px 0 0',
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '11px',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#666',
                            }}
                        >
                            miembros de WTTC · LATA · USTOA
                        </p>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '28px',
                        }}
                    >
                        <div
                            style={{
                                borderTop: '3px solid #000',
                                paddingTop: '12px',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: '16px',
                                    marginBottom: '8px',
                                }}
                            >
                                Misión
                                <span style={{ color: RED }}>—</span>
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '13.5px',
                                    lineHeight: 1.55,
                                    color: '#222',
                                }}
                            >
                                Facilitar experiencias de viaje únicas y
                                memorables en Argentina y Sudamérica, diseñando
                                recorridos innovadores y personalizados,
                                respaldados por un equipo apasionado y experto
                                que garantiza la satisfacción del pasajero en
                                cada etapa.
                            </p>
                        </div>
                        <div
                            style={{
                                borderTop: '3px solid #000',
                                paddingTop: '12px',
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "'Archivo', sans-serif",
                                    fontWeight: 900,
                                    fontSize: '16px',
                                    marginBottom: '8px',
                                }}
                            >
                                Visión
                                <span style={{ color: RED }}>—</span>
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '13.5px',
                                    lineHeight: 1.55,
                                    color: '#222',
                                }}
                            >
                                Ser el principal referente en viajes receptivos
                                en Argentina y Sudamérica, líderes en innovación
                                y calidad, superando constantemente las
                                expectativas y estableciendo nuevos estándares
                                en la industria del turismo.
                            </p>
                        </div>
                        <div style={{ position: 'relative', height: '150px' }}>
                            <ImageSlot
                                src="/img/portal/institucional/ushuaia-01.jpg"
                                alt="Ushuaia — Beagle Channel, Tierra del Fuego"
                                placeholder="Ushuaia — blanco y negro"
                                grayscale
                            />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '52px' }}>
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: '19px',
                            borderBottom: '3px solid #000',
                            paddingBottom: '10px',
                            marginBottom: '20px',
                        }}
                    >
                        Valores
                        <span style={{ color: RED }}>—</span>
                    </div>
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5,1fr)',
                            gap: '24px',
                        }}
                    >
                        {VALORES.map((v) => (
                            <div
                                key={v.n}
                                style={{
                                    borderRight: '1px dotted #000',
                                    padding: '0 18px 8px 0',
                                }}
                            >
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 900,
                                        fontSize: '34px',
                                        lineHeight: 0.8,
                                        color: RED,
                                    }}
                                >
                                    {v.n}
                                </div>
                                <div
                                    style={{
                                        fontFamily: "'Archivo', sans-serif",
                                        fontWeight: 800,
                                        fontSize: '14px',
                                        letterSpacing: '-0.01em',
                                        margin: '12px 0 8px',
                                        lineHeight: 1.05,
                                    }}
                                >
                                    {v.t}
                                </div>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: '12px',
                                        lineHeight: 1.5,
                                        color: '#333',
                                    }}
                                >
                                    {v.d}
                                </p>
                            </div>
                        ))}
                    </div>
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
                    mantiene— De Bin, Aldo · actualizado 06·2026
                </div>
            </section>
        </>
    );
}

Institucional.layout = { active: 'institucional', label: 'Institucional—' };
