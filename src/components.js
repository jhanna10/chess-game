
function Square(props) {
    const highlight = props.availableMoves.includes(props.id) ? 'highlight' : '';
    const wClasses = `sWhite square ${props.piece} ${highlight}`;
    const bClasses = `sBlack square ${props.piece} ${highlight}`;
    const isEvenRow = Math.floor(props.id / 10) % 2 === 0;
    const isEvenCol = props.id % 2 === 0;
  
    const isWhite = isEvenRow ? !isEvenCol : isEvenCol;
  
    return (
      <button
        className={isWhite ? wClasses : bClasses}
        value={props.piece}
        onClick={() => props.onSquareClick(props.id, props.piece)}
      />
    );
  }
  
  function PrevMove(props) {
    return (
      <button 
        className='button'
        onClick={() => props.onClick()}
      >&lt;</button>
    );
  }
  
  function NextMove(props) {
    return (
      <button  
        className='button'
        onClick={() => props.onClick()}  
      >&gt;</button>
    );
  }
  
  function Play(props) {
    return (  
      <button
        className='button'
        onClick={() => props.onClick()}
      >&#10148;</button>
    );
  }
  
  function FirstMove(props) {
    return ( 
      <button
        className='button'
        onClick={() => props.onClick()}
      >&lt;&lt;</button>
    );
  }
  
  function LastMove(props) {
    return (
      <button
        className='button'
        onClick={() => props.onClick()}
      >&gt;&gt;</button>
    );
  }

  export {Square, PrevMove, LastMove, Play, FirstMove, NextMove};