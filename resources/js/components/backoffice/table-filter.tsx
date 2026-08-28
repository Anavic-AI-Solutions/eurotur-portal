import { boFieldClass } from '@/components/backoffice/field';

export function TableFilter({
    value,
    onChange,
    placeholder,
    matched,
    total,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    matched: number;
    total: number;
}) {
    return (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className={
                    boFieldClass +
                    ' max-w-xs py-1 text-[12.5px] font-medium outline-none'
                }
            />

            <span className="bo-label">
                {matched} de {total} · filtra la página actual
            </span>
        </div>
    );
}
