'use client';

import styles from '@/app/styles/home.module.css'

interface spaceProps {
    symbol: string;
    toggleSpace: Function;
}

export default function Space(props: spaceProps) {

    function handleClick() {
        props.toggleSpace();
    }

    return <div className={styles.boardSpace} onClick={handleClick}>
        {props.symbol}
    </div>
}