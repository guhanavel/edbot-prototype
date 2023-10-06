import React from "react";


type Props = {
    handleNext: any;
    text:string;
    className:string;
  };

  function Next({ handleNext, text, className }: Props) {
    return (
        <button className = {className}
        onClick = {handleNext}>{text}</button>
    );
  }

export default Next;