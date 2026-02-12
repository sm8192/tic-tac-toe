'use client';

import styles from '@/app/styles/home.module.css';
import xImage from '@/app/assets/X.png';

interface spaceProps {
    chosen: boolean,
    playerMove: Function
}

export default function BasicSpace(props: spaceProps) {

    function handleClick() {
        props.playerMove();
    }

    return (
        <div className={styles.boardSpace} onClick={handleClick}>
            {
                props.chosen ?
                    <img src={xImage.src} height='100px' width='100px' /> :
                    null
            }
        </div>
    );
}