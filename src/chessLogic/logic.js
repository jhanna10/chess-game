import { getMoves, getPawnAttack } from "./moves";
import { useState } from 'react';

const PAWN_MOVE_TWO_SQUARES = 20;

export function useChessLogic() {
    const [pieces, setPieces] = useState(pieceMap);
    const [selectedPiece, setSelectedPiece] = useState(null);
    const [availableMoves, setAvailableMoves] = useState([]);
    const [moveHistory, setMoveHistory] = useState([]);
    const [isWhTurn, setIsWhTurn] = useState(true);
    const [inCheck, setIsInCheck] = useState(false);
    const [boardHistory, setBoardHistory] = useState([pieceMap]);
    //const [gameOver, setGameOver] = useState(false);
    const [currentMove, setCurrentMove] = useState(0);

    function isKingChecked(color, pieceMap, history) {
        const threatenedSquares = [];
        for(let position in pieceMap) {
            const piece = pieceMap[position];
            if(piece[0] !== color) {
                threatenedSquares.push(...getMoves(position, piece, pieceMap, history, isKingChecked));
                if(piece[1] === 'p') {
                    threatenedSquares.push(...getPawnAttack(position, piece));
                }
            }
        }
        
        const kingPiece = color === 'w' ? 'wk' : 'bk';
        const kingId = parseInt(Object.keys(pieceMap).find(key => pieceMap[key] === kingPiece), 10);
    
        return threatenedSquares.includes(kingId);
    }
    
    function movePieceForCheck(move, id, pieces, isWhTurn, moveHistory) {
        let newPieceMap = { ...pieces };
        newPieceMap[move] = newPieceMap[id];
        delete newPieceMap[id];
        
        if(isKingChecked(isWhTurn ? 'w' : 'b', newPieceMap, moveHistory)) {
          return false;
        }else {
          return true;
        }
    }
    
    function movePiece(id, pieces, selectedPiece, isWhTurn, boardHistory, moveHistory) {
        let newPieceMap = { ...pieces };
        newPieceMap[id] = newPieceMap[selectedPiece];
        delete newPieceMap[selectedPiece];
        if(isCastle(id, pieces, selectedPiece)) {
          newPieceMap = castle(id, newPieceMap);
        }else if(isEnPassant(moveHistory)) {
          const deleteId = isWhTurn ? id - 10 : id + 10;
          delete newPieceMap[deleteId];
        }else if(isPromotion(id, pieces, selectedPiece)) {
          newPieceMap[id] = isWhTurn ? 'wq' : 'bq';
        }
    
        setPieces(newPieceMap);
        const oldHistory = boardHistory.slice();
        setBoardHistory([ ...oldHistory, newPieceMap]);
    }
    
    function castle(id, pieceMap, selectedPiece) {
    const newPieceMap = { ...pieceMap };
    if(id % 10 === 7) {
        newPieceMap[id - 1] = isWhTurn ? 'wr' : 'br';
        delete newPieceMap[selectedPiece];
        delete newPieceMap[id + 1];
    }else {
        newPieceMap[id + 1] = isWhTurn ? 'wr' : 'br';
        delete newPieceMap[selectedPiece];
        delete newPieceMap[id - 2];
    }
    return newPieceMap;
    }

    function isPromotion(id, pieces, selectedPiece) {
    if(pieces[selectedPiece].slice(1) === 'p' && 
        (Math.floor(id / 10) === 8 || Math.floor(id / 10) === 1)) {
        return true;
    }
    return false;
    }

    function isEnPassant(moveHistory) {

    // Check en Passant
    if (moveHistory.length > 0) {
        let lastMove = moveHistory[moveHistory.length - 1];
        let lastPieceMoved = Object.keys(lastMove)[0];
        let lastMoveDetails = Object.values(lastMove)[0];

        // Check if the last moved piece was a pawn and moved two squares
        if (lastPieceMoved.includes('p') && Math.abs(lastMoveDetails.new - lastMoveDetails.prev) === PAWN_MOVE_TWO_SQUARES) {
        let lastMoveCurrentPos = lastMoveDetails.new;
        
        // Check if the current pawn is adjacent to the last moved pawn
        if (Math.abs(lastMoveCurrentPos - selectedPiece) === 1) {
            return true;
        }
        }
    }
    return false;
    }

    function isCastle(id, pieces, selectedPiece) {
        if(pieces[selectedPiece] === 'wk' || pieces[selectedPiece] === 'bk') {
            if(Math.abs(selectedPiece % 10 - id % 10) === 2) {
                return true;
            }
        }
        return false;
    }

    return {
        pieces,
        setPieces,
        selectedPiece,
        setSelectedPiece,
        availableMoves, 
        setAvailableMoves,
        moveHistory, 
        setMoveHistory,
        isWhTurn,
        setIsWhTurn,
        inCheck,
        setIsInCheck,
        boardHistory, 
        setBoardHistory,
        //gameOver, 
        //setGameOver,
        currentMove,
        setCurrentMove,
        isKingChecked,
        movePieceForCheck,
        movePiece
    };
}


const pieceMap = {
    81: 'br', 88: 'br',
    82: 'bn', 87: 'bn',
    83: 'bb', 86: 'bb',
    84: 'bq',
    85: 'bk',
    71: 'bp', 72: 'bp', 73: 'bp', 74: 'bp', 
    75: 'bp', 76: 'bp', 77: 'bp', 78: 'bp',
    11: 'wr', 18: 'wr',
    12: 'wn', 17: 'wn',
    13: 'wb', 16: 'wb',
    14: 'wq',
    15: 'wk',
    21: 'wp', 22: 'wp', 23: 'wp', 24: 'wp', 
    25: 'wp', 26: 'wp', 27: 'wp', 28: 'wp'
  };