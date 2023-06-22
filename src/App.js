import './App.css';
import { getMoves } from './chessLogic/moves';
import { useChessLogic } from './chessLogic/logic.js';
import { useEffect } from 'react';
import { Square, PrevMove, FirstMove, Play, NextMove, LastMove } from './components.js';

const BOARD_SIZE = 8;


function Board() {

  const {
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
  } = useChessLogic();

  const rows = Array.from({ length: BOARD_SIZE }, (_, i) => BOARD_SIZE - i); // [8, 7, 6, 5, 4, 3, 2, 1]
  const columns = Array.from({ length: BOARD_SIZE }, (_, i) => i + 1); // [1, 2, 3, 4, 5, 6, 7, 8]

  useEffect(() => {
    setCurrentMove(moveHistory.length);
  }, [moveHistory.length, setCurrentMove]);

  useEffect(() => {
    setIsInCheck(isKingChecked(isWhTurn ? 'w' : 'b', pieces, moveHistory));
  }, [pieces, moveHistory, isWhTurn, isKingChecked, setIsInCheck]);

  useEffect(() => {
    let moves = new Set();
    if(inCheck) {
      let turn = isWhTurn ? 'w' : 'b';
      for(let id in pieces) {
        if(pieces[id].slice(0, 1) === turn) {
          let pieceMoves = getMoves(id, pieces[id], pieces, moveHistory, inCheck);       
          let movesCopy = pieceMoves.slice();
          for(const move of movesCopy) {
            let validMove = movePieceForCheck(move, id, pieces, isWhTurn, moveHistory);
            if(!validMove) {
              const index = pieceMoves.indexOf(move);
              pieceMoves.splice(index, 1);
            } 
          }
          if(pieceMoves.length !== 0) {
            moves.add( ...pieceMoves );
          }
        }
      }
      if(moves.size < 1) {
        //setGameOver(true);
        alert('game over');
      }
    }
  }, [inCheck, moveHistory, isWhTurn, pieces, movePieceForCheck]);

  function switchTurn() {
    setIsWhTurn(!isWhTurn);
  }

  function isPlayersTurn(piece) {
    const isWhite = piece.slice(0, 1) === 'w';
    return isWhite === isWhTurn;
  }

  const handeClick = (id, piece) => {
    if(piece !== undefined && isPlayersTurn(piece) && currentMove === boardHistory.length - 1) {
      let moves = getMoves(id, piece, pieces, moveHistory, isKingChecked);
      let movesCopy = moves.slice();
      for(const move of movesCopy) {
        let validMove = movePieceForCheck(move, id, pieces, isWhTurn, moveHistory);
        if(!validMove) {
          const index = moves.indexOf(move);
          moves.splice(index, 1);
        }
      }
      setSelectedPiece(id);
      setAvailableMoves(moves);
    }else if(availableMoves.includes(id)) {
      movePiece(id, pieces, selectedPiece, isWhTurn, boardHistory, moveHistory)
      setSelectedPiece(null);
      setAvailableMoves([]);
      let newHistory = moveHistory.slice();
      newHistory.push({[pieces[selectedPiece]]: { prev: selectedPiece, new: id }});
      setMoveHistory(newHistory);
      switchTurn();
    }
  }

  function goBack() {
    if(currentMove > 0) {
      setPieces(boardHistory[currentMove - 1]);
      setCurrentMove(currentMove => currentMove - 1);
      setSelectedPiece(undefined);
      setAvailableMoves([]);
    }
  }
  
  function goNext() {
    if(currentMove < boardHistory.length - 1) {
      setPieces(boardHistory[currentMove + 1]);
      setCurrentMove(currentMove => currentMove + 1);
      setSelectedPiece(undefined);
      setAvailableMoves([]);
    }
  }

  function goFirst() {
    setPieces(boardHistory[0]);
    setCurrentMove(0);
    setSelectedPiece(undefined);
    setAvailableMoves([]);
  }

  function goLast() {
    setPieces(boardHistory[boardHistory.length - 1]);
    setCurrentMove(boardHistory.length - 1);
    setSelectedPiece(undefined);
    setAvailableMoves([]);
  }

  function setPlay() {
    let newBoardHistory = [ ...boardHistory ];
    newBoardHistory.splice(currentMove + 1);
    setBoardHistory(newBoardHistory);
    setCurrentMove(newBoardHistory.length - 1);
    setIsWhTurn(newBoardHistory.length % 2 === 0 ? false : true);
  }


  return (
    <div class='game-wrapper'>
      <div class='board-wrapper'>
        {rows.map((row) => (
          <div key={row}>
            {row}
            {columns.map((col) => {
              const id = row * 10 + col;
              const piece = pieces[id];
              return (
                <Square 
                  key={id}  
                  id={id}
                  piece={piece}
                  onSquareClick={handeClick}
                  availableMoves={availableMoves} 
                />
              );
            })}
          </div>
        ))}
      </div>
      <div class='buttons-wrapper'>
        <FirstMove
          onClick={goFirst}
        />
        <PrevMove
          onClick={goBack} 
        />
        <Play 
          onClick={setPlay}
        />
        <NextMove 
          onClick={goNext}
        />
        <LastMove
          onClick={goLast}
        />
      </div>
    </div>
  );
}


function App() {
  return (
    <Board />
  );
}


export default App;
