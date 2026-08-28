import { Form } from '@inertiajs/react';
import { useState } from 'react';
import SectorGroupController from '@/actions/App/Http/Controllers/Portal/SectorGroupController';
import SectorItemController from '@/actions/App/Http/Controllers/Portal/SectorItemController';
import InputError from '@/components/input-error';
import { sectorPermission, usePermissions } from '@/hooks/use-permissions';

const RED = '#E30613';
const LINK_UNDERLINE = '1px solid #c4c4c4';

export type SectorItem = {
    id?: number;
    t: string;
    h?: string | null;
    badge?: string | null;
};
export type SectorGroup = { id?: number; title: string; items: SectorItem[] };

export type SectorIndexData = {
    kicker: string;
    title: string;
    num: string;
    intro: string;
    maint: string;
    groups: SectorGroup[];
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

export function SectorIndex({
    data,
    sector,
}: {
    data: SectorIndexData;
    sector: string;
}) {
    const { can } = usePermissions();
    // Editing is scoped to the sector this index renders, not to the portal
    // as a whole: a sector editor must not see controls they cannot use.
    const canEdit = can(sectorPermission(sector));
    const [editing, setEditing] = useState(false);

    return (
        <section>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '40px',
                    marginBottom: '30px',
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
                        {data.kicker}
                    </div>
                    <h1
                        style={{
                            fontFamily: "'Anton', sans-serif",
                            fontWeight: 400,
                            fontSize: 'clamp(64px,9vw,132px)',
                            lineHeight: 0.86,
                            margin: 0,
                            letterSpacing: '-0.005em',
                        }}
                    >
                        {data.title}
                        <span style={{ color: RED }}>.</span>
                    </h1>
                    <p
                        style={{
                            maxWidth: '480px',
                            margin: '18px 0 0',
                            fontSize: '15px',
                            lineHeight: 1.5,
                            fontWeight: 500,
                            color: '#111',
                        }}
                    >
                        {data.intro}
                    </p>
                </div>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '14px',
                    }}
                >
                    <div
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 900,
                            fontSize: 'clamp(80px,10vw,140px)',
                            lineHeight: 0.72,
                        }}
                    >
                        {data.num}
                    </div>
                    {canEdit && (
                        <button
                            type="button"
                            onClick={() => setEditing((v) => !v)}
                            style={{
                                ...smallButtonStyle,
                                background: editing ? RED : 'transparent',
                                color: editing ? '#fff' : '#000',
                                borderColor: editing ? RED : '#000',
                            }}
                        >
                            {editing ? 'Listo ✕' : 'Editar ✎'}
                        </button>
                    )}
                </div>
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4,1fr)',
                    gap: 0,
                    borderTop: '3px solid #000',
                }}
            >
                {data.groups.map((g, i) => (
                    <SectorGroupColumn
                        key={g.id ?? g.title}
                        group={g}
                        index={i}
                        editing={editing}
                    />
                ))}
            </div>

            {editing && (
                <div style={{ marginTop: '18px' }}>
                    <AddGroupForm sector={sector} />
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    marginTop: '34px',
                    borderTop: '1px solid #000',
                    paddingTop: '14px',
                }}
            >
                <div
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '10px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#666',
                    }}
                >
                    mantiene— {data.maint}
                </div>
            </div>
        </section>
    );
}

function SectorGroupColumn({
    group,
    index,
    editing,
}: {
    group: SectorGroup;
    index: number;
    editing: boolean;
}) {
    const [addingItem, setAddingItem] = useState(false);

    return (
        <div
            style={{
                borderTop: '3px solid #000',
                borderRight: '1px dotted #000',
                padding: `14px 18px 26px ${index % 4 === 0 ? '0' : '18px'}`,
                marginTop: '-3px',
                minHeight: '120px',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '10px',
                    marginBottom: '12px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: '10px',
                    }}
                >
                    <span
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontWeight: 700,
                            fontSize: '11px',
                        }}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span
                        style={{
                            fontFamily: "'Archivo', sans-serif",
                            fontWeight: 800,
                            fontSize: '16px',
                            letterSpacing: '-0.01em',
                            lineHeight: 1.05,
                        }}
                    >
                        {group.title}
                    </span>
                </div>
                {editing && group.id && (
                    <Form
                        {...SectorGroupController.destroy.form({
                            group: group.id,
                        })}
                    >
                        {({ processing }) => (
                            <button
                                type="submit"
                                disabled={processing}
                                title="Eliminar grupo"
                                style={{
                                    all: 'unset',
                                    cursor: 'pointer',
                                    color: RED,
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '11px',
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </Form>
                )}
            </div>
            <div
                style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}
            >
                {group.items.map((item) => (
                    <SectorItemRow
                        key={item.id ?? item.t}
                        item={item}
                        editing={editing}
                    />
                ))}
            </div>

            {editing && group.id && (
                <div style={{ marginTop: '12px' }}>
                    {addingItem ? (
                        <AddItemForm
                            groupId={group.id}
                            onDone={() => setAddingItem(false)}
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setAddingItem(true)}
                            style={smallButtonStyle}
                        >
                            + agregar link
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function RequiredField({
    name,
    placeholder,
    defaultValue,
}: {
    name: string;
    placeholder: string;
    defaultValue?: string;
}) {
    const [invalid, setInvalid] = useState(false);

    return (
        <div>
            <input
                name={name}
                placeholder={placeholder}
                defaultValue={defaultValue}
                required
                aria-invalid={invalid || undefined}
                onInvalid={() => setInvalid(true)}
                onInput={(e) => {
                    if (e.currentTarget.value) {
                        setInvalid(false);
                    }
                }}
                style={{
                    ...labelFieldStyle,
                    borderColor: invalid ? RED : undefined,
                }}
            />
            {invalid && <InputError message="Completa este campo" />}
        </div>
    );
}

function SectorItemRow({
    item,
    editing,
}: {
    item: SectorItem;
    editing: boolean;
}) {
    const [editingItem, setEditingItem] = useState(false);

    if (editing && item.id && editingItem) {
        return (
            <EditItemForm
                item={item}
                itemId={item.id}
                onDone={() => setEditingItem(false)}
            />
        );
    }

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                flexWrap: 'wrap',
                gap: '8px',
            }}
        >
            {item.h ? (
                <a
                    href={item.h}
                    target="_blank"
                    rel="noreferrer"
                    className="doc-link"
                    style={{
                        textDecoration: 'none',
                        color: '#000',
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 500,
                        fontSize: '13px',
                        lineHeight: 1.25,
                        borderBottom: LINK_UNDERLINE,
                        paddingBottom: '2px',
                        alignSelf: 'flex-start',
                        display: 'inline-flex',
                        alignItems: 'baseline',
                        gap: '5px',
                        transition: 'color .1s,border-color .1s,transform .1s',
                    }}
                >
                    {item.t}
                    <span
                        style={{
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            color: RED,
                        }}
                    >
                        ↗
                    </span>
                </a>
            ) : (
                <div
                    style={{
                        fontFamily: "'Archivo', sans-serif",
                        fontWeight: 500,
                        fontSize: '12.5px',
                        lineHeight: 1.4,
                        color: '#777',
                    }}
                >
                    {item.t}
                </div>
            )}
            {item.badge && (
                <span
                    style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '9px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: RED,
                        border: `1px solid ${RED}`,
                        padding: '2px 5px',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {item.badge}
                </span>
            )}
            {editing && item.id && (
                <div
                    style={{
                        display: 'flex',
                        gap: '6px',
                        flex: '0 0 auto',
                        whiteSpace: 'nowrap',
                        marginLeft: 'auto',
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setEditingItem(true)}
                        title="Editar"
                        style={{
                            all: 'unset',
                            cursor: 'pointer',
                            fontFamily: "'Space Mono', monospace",
                            fontSize: '10px',
                            color: '#666',
                        }}
                    >
                        ✎
                    </button>
                    <Form
                        {...SectorItemController.destroy.form({
                            item: item.id,
                        })}
                    >
                        {({ processing }) => (
                            <button
                                type="submit"
                                disabled={processing}
                                title="Eliminar"
                                style={{
                                    all: 'unset',
                                    cursor: 'pointer',
                                    fontFamily: "'Space Mono', monospace",
                                    fontSize: '10px',
                                    color: RED,
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </Form>
                </div>
            )}
        </div>
    );
}

function AddGroupForm({ sector }: { sector: string }) {
    return (
        <Form
            {...SectorGroupController.store.form({ sector })}
            resetOnSuccess
            className="flex items-end gap-3"
        >
            {({ processing, errors }) => (
                <>
                    <div style={{ flex: 1, maxWidth: '280px' }}>
                        <RequiredField
                            name="title"
                            placeholder="Nuevo grupo…"
                        />
                        <InputError message={errors.title} />
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        style={smallButtonStyle}
                    >
                        + agregar grupo
                    </button>
                </>
            )}
        </Form>
    );
}

function AddItemForm({
    groupId,
    onDone,
}: {
    groupId: number;
    onDone: () => void;
}) {
    const [mode, setMode] = useState<'url' | 'file'>('url');

    return (
        <Form
            {...SectorItemController.store.form({ group: groupId })}
            resetOnSuccess
            onSuccess={onDone}
            className="flex flex-col gap-2"
            style={{ minWidth: '180px' }}
        >
            {({ processing, errors }) => (
                <>
                    <RequiredField name="label" placeholder="Texto del link" />
                    <InputError message={errors.label} />

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '10px',
                        }}
                    >
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'url'}
                                onChange={() => setMode('url')}
                            />
                            URL
                        </label>
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'file'}
                                onChange={() => setMode('file')}
                            />
                            Archivo
                        </label>
                    </div>

                    {mode === 'url' ? (
                        <input
                            name="url"
                            type="url"
                            placeholder="https://…"
                            style={labelFieldStyle}
                        />
                    ) : (
                        <input
                            name="file"
                            type="file"
                            style={{ fontSize: '11px' }}
                        />
                    )}
                    <InputError message={errors.url} />
                    <InputError message={errors.file} />

                    <div style={{ display: 'flex', gap: '8px' }}>
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
                    </div>
                </>
            )}
        </Form>
    );
}

function EditItemForm({
    item,
    itemId,
    onDone,
}: {
    item: SectorItem;
    itemId: number;
    onDone: () => void;
}) {
    const [mode, setMode] = useState<'url' | 'file'>('url');

    return (
        <Form
            {...SectorItemController.update.form({ item: itemId })}
            onSuccess={onDone}
            className="flex flex-col gap-2"
        >
            {({ processing, errors }) => (
                <>
                    <RequiredField
                        name="label"
                        placeholder="Texto del link"
                        defaultValue={item.t}
                    />
                    <InputError message={errors.label} />

                    <div
                        style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '10px',
                        }}
                    >
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'url'}
                                onChange={() => setMode('url')}
                            />
                            URL
                        </label>
                        <label
                            style={{
                                display: 'flex',
                                gap: '4px',
                                alignItems: 'center',
                            }}
                        >
                            <input
                                type="radio"
                                checked={mode === 'file'}
                                onChange={() => setMode('file')}
                            />
                            Reemplazar por archivo
                        </label>
                    </div>

                    {mode === 'url' ? (
                        <input
                            name="url"
                            type="url"
                            defaultValue={item.h ?? ''}
                            placeholder="https://…"
                            style={labelFieldStyle}
                        />
                    ) : (
                        <input
                            name="file"
                            type="file"
                            style={{ fontSize: '11px' }}
                        />
                    )}
                    <InputError message={errors.url} />
                    <InputError message={errors.file} />

                    <div style={{ display: 'flex', gap: '8px' }}>
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
                    </div>
                </>
            )}
        </Form>
    );
}
