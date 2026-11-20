import type { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            {...props}
            src="/logo_klinik.png"
            alt={props.alt ?? 'Logo Klinik'}
            className={`${props.className ?? ''} object-contain`.trim()}
        />
    );
}
