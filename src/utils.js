export function debounce(fn, delay) {
  let timeoutId;
  
  return function (...args) {
    // clears the prev timer
    clearTimeout(timeoutId);
    
    // new timer set
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}