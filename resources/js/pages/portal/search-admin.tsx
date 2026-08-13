import { Form, Head, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import SearchStaticEntryController from '@/actions/App/Http/Controllers/Portal/SearchStaticEntryController';
import SearchSynonymTermController from '@/actions/App/Http/Controllers/Portal/SearchSynonymTermController';
import SectorItemController from '@/actions/App/Http/Controllers/Portal/SectorItemController';
import InputError from '@/components/input-error';

const RED = '#E30613';

function staticEntryId(id: string): number {
    return Number(id.replace('static-', ''));
}

type ItemRow = {
    id: number;
    label: string;
    url: string | null;
    groupTitle: string;
    sectorLabel: string;
    keywords: string | null;
};

type StaticEntryRow = {
    id: string;
    label: string;
    url: string;
    sectorLabel: string | null;
    sectorHref: string | null;
};

type SynonymGroup = {
    groupNumber: number;
    terms: { id: number; term: string }[];
};

type Props = {
    items: ItemRow[];
    staticEntries: StaticEntryRow[];
    synonymGroups: SynonymGroup[];
};

const labelFieldStyle: React.CSSProperties = {
    width: '100%',
    fontFamily: "'Archivo', sans-serif",
    fontSize: '12.5px',
    fontWeight: 500,
    border: 'none',
    borderBottom: '1px solid #000',
    borderRadius: 0,
    padding: '4px 0',
    marginBottom: '6px',
};

const smallButtonStyle: React.CSSProperties = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    background: 'transparent',
    border: '1px solid #000',
    padding: '4px 8px',
    cursor: 'pointer',
};

function SectionHeading({ label, hint }: { label: string; hint: string }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                borderBottom: '3px solid #000',
                paddingBottom: '10px',
                margin: '38px 0 18px',
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
                {label}
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
                {hint}
            </div>
        </div>
    );
}

export default function SearchAdmin({
    items,
    staticEntries,
    synonymGroups,
}: Props) {
    const { auth } = usePage().props;
    const isAuthenticated = Boolean(auth.user);

    return (
        <>
            <Head title="Buscador" />

            <section>
                <div style={{ maxWidth: '600px', marginBottom: '10px' }}>
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
                        administración — keywords · páginas · tesauro
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontWeight: 400,
                            fontSize: 'clamp(56px,8vw,110px)',
                            lineHeight: 0.86,
                            margin: 0,
                            letterSpacing: '-0.005em',
                        }}
                    >
                        Buscador
                        <span style={{ color: RED }}>.</span>
                    </h1>
                </div>

                {!isAuthenticated && (
                    <p style={{ color: '#777', fontSize: '13px' }}>
                        Iniciá sesión para editar keywords, páginas indexadas y
                        el tesauro de sinónimos.
                    </p>
                )}

                <ItemKeywordsSection
                    items={items}
                    isAuthenticated={isAuthenticated}
                />
                <StaticEntriesSection
                    entries={staticEntries}
                    isAuthenticated={isAuthenticated}
                />
                <ThesaurusSection
                    groups={synonymGroups}
                    isAuthenticated={isAuthenticated}
                />
            </section>
        </>
    );
}

function ItemKeywordsSection({
    items,
    isAuthenticated,
}: {
    items: ItemRow[];
    isAuthenticated: boolean;
}) {
    const [filter, setFilter] = useState('');

    const filtered = useMemo(() => {
        const needle = filter.trim().toLowerCase();

        if (needle === '') {
            return items;
        }

        return items.filter((item) =>
            [item.label, item.sectorLabel, item.groupTitle, item.keywords ?? '']
                .join(' ')
                .toLowerCase()
                .includes(needle),
        );
    }, [items, filter]);

    return (
        <div>
            <SectionHeading
                label="keywords por ítem"
                hint={`${items.length} ítems`}
            />
            <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar por ítem, sector o keyword…"
                style={{ ...labelFieldStyle, marginBottom: '16px' }}
            />
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                }}
            >
                <thead>
                    <tr style={{ borderBottom: '2px solid #000' }}>
                        {['Ítem', 'Sector · Grupo', 'Keywords', ''].map((h) => (
                            <th
                                key={h}
                                style={{
                                    textAlign: 'left',
                                    padding: '6px 10px',
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '10px',
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: '#666',
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((item) => (
                        <ItemKeywordsRow
                            key={item.id}
                            item={item}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ItemKeywordsRow({
    item,
    isAuthenticated,
}: {
    item: ItemRow;
    isAuthenticated: boolean;
}) {
    return (
        <tr style={{ borderBottom: '1px dotted #cfcfcf' }}>
            <td
                style={{
                    padding: '8px 10px',
                    fontWeight: 700,
                    maxWidth: '220px',
                }}
            >
                {item.label}
            </td>
            <td
                style={{
                    padding: '8px 10px',
                    color: '#777',
                    maxWidth: '160px',
                }}
            >
                {item.sectorLabel} · {item.groupTitle}
            </td>
            <td style={{ padding: '8px 10px', minWidth: '280px' }}>
                {isAuthenticated ? (
                    <Form
                        {...SectorItemController.update.form({ item: item.id })}
                        className="flex items-start gap-2"
                    >
                        {({ processing, errors }) => (
                            <>
                                <input
                                    type="hidden"
                                    name="label"
                                    value={item.label}
                                />
                                <textarea
                                    name="keywords"
                                    defaultValue={item.keywords ?? ''}
                                    rows={2}
                                    placeholder="keyword1, keyword2, sinónimo…"
                                    style={{
                                        ...labelFieldStyle,
                                        resize: 'vertical',
                                        flex: 1,
                                    }}
                                />
                                <InputError message={errors.keywords} />
                                <button
                                    type="submit"
                                    disabled={processing}
                                    style={smallButtonStyle}
                                >
                                    Guardar
                                </button>
                            </>
                        )}
                    </Form>
                ) : (
                    <span style={{ color: '#999' }}>
                        {item.keywords ?? '—'}
                    </span>
                )}
            </td>
        </tr>
    );
}

function StaticEntriesSection({
    entries,
    isAuthenticated,
}: {
    entries: StaticEntryRow[];
    isAuthenticated: boolean;
}) {
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    return (
        <div>
            <SectionHeading
                label="páginas y accesos indexados"
                hint={`${entries.length} entradas`}
            />
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '13px',
                }}
            >
                <thead>
                    <tr style={{ borderBottom: '2px solid #000' }}>
                        {['Título', 'URL', 'Sector', ''].map((h) => (
                            <th
                                key={h}
                                style={{
                                    textAlign: 'left',
                                    padding: '6px 10px',
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '10px',
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: '#666',
                                }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {entries.map((entry) =>
                        editingId === entry.id ? (
                            <tr key={entry.id}>
                                <td colSpan={4} style={{ padding: '10px' }}>
                                    <StaticEntryForm
                                        entry={entry}
                                        onDone={() => setEditingId(null)}
                                    />
                                </td>
                            </tr>
                        ) : (
                            <tr
                                key={entry.id}
                                style={{ borderBottom: '1px dotted #cfcfcf' }}
                            >
                                <td
                                    style={{
                                        padding: '8px 10px',
                                        fontWeight: 700,
                                    }}
                                >
                                    {entry.label}
                                </td>
                                <td
                                    style={{
                                        padding: '8px 10px',
                                        color: '#777',
                                        wordBreak: 'break-all',
                                    }}
                                >
                                    {entry.url}
                                </td>
                                <td
                                    style={{
                                        padding: '8px 10px',
                                        color: '#777',
                                    }}
                                >
                                    {entry.sectorLabel ?? '—'}
                                </td>
                                <td
                                    style={{
                                        padding: '8px 10px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {isAuthenticated && (
                                        <span
                                            style={{
                                                display: 'flex',
                                                gap: '8px',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setEditingId(entry.id)
                                                }
                                                title="Editar"
                                                style={{
                                                    all: 'unset',
                                                    cursor: 'pointer',
                                                    fontFamily:
                                                        "'Space Mono', monospace",
                                                    fontSize: '11px',
                                                    color: '#666',
                                                }}
                                            >
                                                ✎
                                            </button>
                                            <Form
                                                {...SearchStaticEntryController.destroy.form(
                                                    {
                                                        entry: staticEntryId(
                                                            entry.id,
                                                        ),
                                                    },
                                                )}
                                            >
                                                {({ processing }) => (
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        title="Eliminar"
                                                        style={{
                                                            all: 'unset',
                                                            cursor: 'pointer',
                                                            fontFamily:
                                                                "'Space Mono', monospace",
                                                            fontSize: '11px',
                                                            color: RED,
                                                        }}
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </Form>
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ),
                    )}
                </tbody>
            </table>

            {isAuthenticated && (
                <div style={{ paddingTop: '14px' }}>
                    {adding ? (
                        <StaticEntryForm onDone={() => setAdding(false)} />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setAdding(true)}
                            style={smallButtonStyle}
                        >
                            + agregar entrada
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function StaticEntryForm({
    entry,
    onDone,
}: {
    entry?: StaticEntryRow;
    onDone: () => void;
}): ReactNode {
    const action = entry
        ? SearchStaticEntryController.update.form({
              entry: staticEntryId(entry.id),
          })
        : SearchStaticEntryController.store.form();

    return (
        <Form
            {...action}
            onSuccess={onDone}
            className="flex flex-wrap items-end gap-3"
        >
            {({ processing, errors }) => (
                <>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                        <input
                            name="title"
                            placeholder="Título"
                            defaultValue={entry?.label}
                            required
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.title} />
                    </div>
                    <div style={{ flex: 2, minWidth: '240px' }}>
                        <input
                            name="url"
                            placeholder="URL (interna o externa)"
                            defaultValue={entry?.url}
                            required
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.url} />
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <input
                            name="sector_label"
                            placeholder="Sector (opcional)"
                            defaultValue={entry?.sectorLabel ?? ''}
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.sector_label} />
                    </div>
                    <div style={{ flex: 1, minWidth: '160px' }}>
                        <input
                            name="sector_href"
                            placeholder="Link del sector (opcional)"
                            defaultValue={entry?.sectorHref ?? ''}
                            style={labelFieldStyle}
                        />
                        <InputError message={errors.sector_href} />
                    </div>
                    <div style={{ flex: '1 1 100%' }}>
                        <textarea
                            name="keywords"
                            placeholder="keyword1, keyword2, sinónimo…"
                            rows={2}
                            style={{ ...labelFieldStyle, resize: 'vertical' }}
                        />
                        <InputError message={errors.keywords} />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        style={smallButtonStyle}
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        onClick={onDone}
                        style={smallButtonStyle}
                    >
                        Cancelar
                    </button>
                </>
            )}
        </Form>
    );
}

function ThesaurusSection({
    groups,
    isAuthenticated,
}: {
    groups: SynonymGroup[];
    isAuthenticated: boolean;
}) {
    const [addingToGroup, setAddingToGroup] = useState<number | null>(null);
    const nextGroupNumber = (groups.at(-1)?.groupNumber ?? 0) + 1;
    const [creatingGroup, setCreatingGroup] = useState(false);

    return (
        <div>
            <SectionHeading
                label="tesauro de sinónimos"
                hint={`${groups.length} grupos`}
            />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                }}
            >
                {groups.map((group) => (
                    <div
                        key={group.groupNumber}
                        style={{
                            border: '1px solid #dcdcdc',
                            padding: '10px 14px',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '9px',
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: '#999',
                                marginBottom: '8px',
                            }}
                        >
                            grupo {group.groupNumber}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px',
                                alignItems: 'center',
                            }}
                        >
                            {group.terms.map((term) => (
                                <span
                                    key={term.id}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        border: '1px solid #000',
                                        padding: '3px 8px',
                                        fontSize: '12px',
                                    }}
                                >
                                    {term.term}
                                    {isAuthenticated && (
                                        <Form
                                            {...SearchSynonymTermController.destroy.form(
                                                { term: term.id },
                                            )}
                                        >
                                            {({ processing }) => (
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    title="Eliminar término"
                                                    style={{
                                                        all: 'unset',
                                                        cursor: 'pointer',
                                                        color: RED,
                                                        fontSize: '11px',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </Form>
                                    )}
                                </span>
                            ))}
                            {isAuthenticated &&
                                (addingToGroup === group.groupNumber ? (
                                    <AddTermForm
                                        groupNumber={group.groupNumber}
                                        onDone={() => setAddingToGroup(null)}
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setAddingToGroup(group.groupNumber)
                                        }
                                        style={smallButtonStyle}
                                    >
                                        + término
                                    </button>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            {isAuthenticated && (
                <div style={{ paddingTop: '14px' }}>
                    {creatingGroup ? (
                        <AddTermForm
                            groupNumber={nextGroupNumber}
                            onDone={() => setCreatingGroup(false)}
                            isNewGroup
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setCreatingGroup(true)}
                            style={smallButtonStyle}
                        >
                            + nuevo grupo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function AddTermForm({
    groupNumber,
    onDone,
    isNewGroup,
}: {
    groupNumber: number;
    onDone: () => void;
    isNewGroup?: boolean;
}): ReactNode {
    return (
        <Form
            {...SearchSynonymTermController.store.form()}
            resetOnSuccess
            onSuccess={onDone}
            className="flex items-center gap-2"
        >
            {({ processing, errors }) => (
                <>
                    <input
                        type="hidden"
                        name="group_number"
                        value={groupNumber}
                    />
                    <input
                        name="term"
                        placeholder={
                            isNewGroup
                                ? `término del grupo ${groupNumber}`
                                : 'nuevo término'
                        }
                        required
                        autoFocus
                        style={{
                            ...labelFieldStyle,
                            width: '160px',
                            marginBottom: 0,
                        }}
                    />
                    <InputError message={errors.term} />
                    <button
                        type="submit"
                        disabled={processing}
                        style={smallButtonStyle}
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        onClick={onDone}
                        style={smallButtonStyle}
                    >
                        Cancelar
                    </button>
                </>
            )}
        </Form>
    );
}

SearchAdmin.layout = { active: 'search-admin', label: 'Buscador—' };
