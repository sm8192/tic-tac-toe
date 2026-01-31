'use client';

import styles from '@/app/styles/home.module.css';
import oImage from '@/app/assets/O.png';
import xImage from '@/app/assets/X.png';
import blankImage from '@/app/assets/White_Pixel_1x1.png';

interface spaceProps {
    symbol: string;
    toggleSpace: Function;
}

export default function TicTacToeSpace(props: spaceProps) {

    function chooseImage(symbol: string) {
        if (symbol == 'X') {
            return xImage.src;
        } else if (symbol == 'O') {
            return oImage.src;
        } else {
            return blankImage.src;
        }
    }

    function handleClick() {
        props.toggleSpace();
    }

    return (
        <div className={styles.boardSpace} onClick={handleClick}>
            <img src={chooseImage(props.symbol)} height='100px' width='100px' />
        </div>
    );
}