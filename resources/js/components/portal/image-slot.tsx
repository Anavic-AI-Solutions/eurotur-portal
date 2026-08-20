export function ImageSlot({
    src,
    alt,
    placeholder,
    grayscale,
    contain,
}: {
    src?: string;
    alt?: string;
    placeholder: string;
    grayscale?: boolean;
    contain?: boolean;
}) {
    if (src) {
        return (
            <img
                src={src}
                alt={alt ?? placeholder}
                style={
                    contain
                        ? {
                              display: 'block',
                              width: '100%',
                              height: 'auto',
                              ...(grayscale
                                  ? { filter: 'grayscale(100%)' }
                                  : {}),
                          }
                        : {
                              position: 'absolute',
                              inset: 0,
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              ...(grayscale
                                  ? { filter: 'grayscale(100%)' }
                                  : {}),
                          }
                }
            />
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                    'repeating-linear-gradient(45deg,#111 0 2px,#e9e9e9 2px 11px)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px',
            }}
        >
            <span
                style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#000',
                    background: '#fff',
                    padding: '4px 8px',
                }}
            >
                {placeholder}
            </span>
        </div>
    );
}
