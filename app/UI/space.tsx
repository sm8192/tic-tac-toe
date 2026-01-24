'use client';

interface spaceProps {
    symbol: string;
    row: number;
    column: number;
}

export default function Space(props: spaceProps) {
    return <div>
        {props.symbol}
    </div>
}