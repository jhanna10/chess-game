

export function getMoves(id, piece, pieceMap, history, isKingChecked) {
    const x = id % 10;
    const y = Math.floor(id / 10);
    const color = piece.slice(0, 1);
    piece = piece.slice(1);
    // console.log('history: ' + JSON.stringify(history));
    //console.log('pieceMap: ' + JSON.stringify(pieceMap));
    const pieceMoves = {
      'p': getPawnMove,
      'r': getRookMoves,
      'n': getKnightMoves,
      'b': getBishopMoves,
      'k': getKingMoves,
      'q': getQueenMoves,
    };
    
    const moves = pieceMoves[piece](x, y, color, pieceMap, history, isKingChecked);

    return moves;
}

function getPawnMove(x, y, color, pieceMap, history) {
  let validMoves = [];
  let dir = color === 'b' ? -1 : 1;
  let pos = y * 10 + x;

  // Helper function to check capture moves
  const checkCaptureMoves = (direction) => {
    if (pieceMap[pos + direction] && pieceMap[pos + direction].slice(0, 1) !== color) {
      validMoves.push(pos + direction);
    }
  }

  // Check double move for pawn on initial row
  if (y === (color === 'b' ? 7 : 2) && !pieceMap[pos + 20 * dir]) {
    validMoves.push(pos + 20 * dir);
  }

  // Check forward move
  if ((color === 'b' && y > 1) || (color !== 'b' && y < 8)) {
    if (!pieceMap[pos + 10 * dir]) {
      validMoves.push(pos + 10 * dir);
    }
  }

  // Check capture moves
  if (color === 'b') {
    checkCaptureMoves(-9);
    checkCaptureMoves(-11);
  } else {
    checkCaptureMoves(9);
    checkCaptureMoves(11);
  }

  
  // Check en Passant
  if (history.length > 0) {
    let lastMove = history[history.length - 1];
    let lastPieceMoved = Object.keys(lastMove)[0];
    let lastMoveDetails = Object.values(lastMove)[0];
  
    // Check if the last moved piece was a pawn and moved two squares
    if (lastPieceMoved.includes('p') && Math.abs(lastMoveDetails.new - lastMoveDetails.prev) === 20) {
      let lastMoveCurrentPos = lastMoveDetails.new;
      
      // Check if the current pawn is adjacent to the last moved pawn
      if (Math.abs(lastMoveCurrentPos - pos) === 1) {
        let direction = color === 'b'
          ? (lastMoveCurrentPos < pos ? -11 : -9)
          : (lastMoveCurrentPos < pos ? 9 : 11);
        let enPassantPos = pos + direction;
        validMoves.push(enPassantPos);
      }
    }
  }

  return validMoves;
}

export function getPawnAttack(position, piece) {
  let moves = [];
  if(piece[0] === 'w' && position / 10 < 8) {
    moves.push(position + 11);
    moves.push(position + 9);
  }else if(piece[0] === 'b' && position / 10 > 1) {
    moves.push(position - 9);
    moves.push(position - 11);
  }
  return moves;
}

function getRookMoves(x, y, color, pieceMap) {
  const rookMoves = [
    [1, 0], [-1, 0],
    [0, 1], [0, -1]
  ];

  return getStraightLineMoves(x, y, color, pieceMap, rookMoves);
}

function getKnightMoves(x, y, color, pieceMap) {
  const knightMoves = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ];
  return getSingleMoves(x, y, color, pieceMap, knightMoves);
}

function getBishopMoves(x, y, color, pieceMap) {
  const bishDirections = [
    [1, 1], [1, -1],
    [-1, -1], [-1, 1]
  ];

  return getStraightLineMoves(x, y, color, pieceMap, bishDirections);
}

function getKingMoves(x, y, color, pieceMap, history, isKingChecked) {
  const kingMoves = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [-1, 1], [1, -1], [-1, -1] 
  ];
  let moves = color === 'w' ? checkCastleW(pieceMap, history, isKingChecked) : checkCastleB(pieceMap, history, isKingChecked);
  moves.push(...getSingleMoves(x, y, color, pieceMap, kingMoves));
  return moves;
}

function getQueenMoves(x, y, color, pieceMap) {
  const queenDirections = [
    [0, 1], [0, -1], [1, 0], [-1, 0],
    [1, 1], [-1, 1], [1, -1], [-1, -1] 
  ];
  
  return getStraightLineMoves(x, y, color, pieceMap, queenDirections);
}

function getStraightLineMoves(x, y, color, pieceMap, directions) {
  let validMoves = [];

  for(let [dx, dy] of directions) {
    let newX = x + dx;
    let newY = y + dy;

    while(newX >= 1 && newX < 9 && newY >= 1 && newY < 9) {
      
      let move = newY * 10 + newX;
      let current = pieceMap[newY * 10 + newX];
      if(current === undefined) {
        validMoves.push(move);
      } else {
        if(current[0] !== color) {
          validMoves.push(move);
        }
        break;
      }

      newX += dx;
      newY += dy;
    }
  }
  return validMoves;
}

function getSingleMoves(x, y, color, pieceMap, directions) {
  let validMoves = [];

  for(let [dx, dy] of directions) {
    let newX = x + dx;
    let newY = y + dy;
    let move = newY * 10 + newX;
    let current = pieceMap[newY * 10 + newX];

    if(newX >= 1 && newX < 9 && newY >= 1 && newY < 9) {
      validMoves.push(current === undefined || current[0] !== color ? move : null);
    }
  }

  // remove null values
  return validMoves.filter(move => move !== null);
}

function checkCastleW(pieceMap, history, isKingChecked) {
  const didKingMove = history.some(obj => 'wk' in obj);
  const didKRookMove = history.some(obj => Object.values(obj).includes(18));
  const didQRookMove = history.some(obj => Object.values(obj).includes(11));

  if(didKingMove) {
    return [];
  }
  let moves = [];

  if(!(14 in pieceMap) && !(13 in pieceMap) && !(12 in pieceMap) && !didQRookMove) {
    let newPieceMap1 = { ...pieceMap };
    let newPieceMap2 = { ...pieceMap };
    newPieceMap1[13] = 'wk';
    newPieceMap2[14] = 'wk';  
    if(!isKingChecked('w', newPieceMap1, history) && !isKingChecked('w', newPieceMap2, history)) {
      moves.push(13);
    }
    
  }
  if(!(16 in pieceMap) && !(17 in pieceMap) && !didKRookMove) {
    let newPieceMap1 = { ...pieceMap };
    let newPieceMap2 = { ...pieceMap };
    newPieceMap1[17] = 'wk';
    newPieceMap2[16] = 'wk';  
    if(!isKingChecked('w', newPieceMap1, history) && !isKingChecked('w', newPieceMap2, history)) {
      moves.push(17);
    }
    
  }
  return moves;
}

function checkCastleB(pieceMap, history, isKingChecked) {
  const didKingMove = history.some(obj => 'bk' in obj);
  const didKRookMove = history.some(obj => Object.values(obj).includes(88));
  const didQRookMove = history.some(obj => Object.values(obj).includes(81));

  if(didKingMove) {
    return [];
  }
  let moves = [];
  if(!(84 in pieceMap) && !(83 in pieceMap) && !(82 in pieceMap) && !didQRookMove) {
    let newPieceMap1 = { ...pieceMap };
    let newPieceMap2 = { ...pieceMap };
    newPieceMap1[83] = 'bk';
    newPieceMap2[84] = 'bk';  
    if(!isKingChecked('b', newPieceMap1, history) && !isKingChecked('b', newPieceMap2, history)) {
      moves.push(83);
    }
  }
  if(!(86 in pieceMap) && !(87 in pieceMap) && !didKRookMove) {
    let newPieceMap1 = { ...pieceMap };
    let newPieceMap2 = { ...pieceMap };
    newPieceMap1[87] = 'bk';
    newPieceMap2[86] = 'bk';  
    if(!isKingChecked('b', newPieceMap1, history) && !isKingChecked('b', newPieceMap2, history)) {
      moves.push(87);
    }
  }
  return moves;
}