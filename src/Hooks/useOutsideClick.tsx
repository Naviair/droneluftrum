import { RefObject, useEffect } from "react";

/**
 * 
 * @param ref 
 * @param callback 
 */


export const useOutsideClick = (ref:RefObject<HTMLDivElement>, callback:()=>void) => {
  const handleClick = (e:MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  });
};