/**
 * This practice question is from
 * https://eloquentjavascript.net/02_program_structure.html
 * https://eloquentjavascript.net/
 */

const board = 8;

let counter = 0;
let result = [];
while (counter < board) {
    let output = '';
    let startWithSpace = counter % 2 === 0;
    for (let i = 0; i < board; i++) {
        if (i % 2 === 0) {
            output += startWithSpace ? ' ' : '#';
        } else {
            output += startWithSpace ? '#' : ' ';
        }
    }
    result.push(output);
    counter++;
}

console.log(result.join('\n'));


// improved after checked the answer from the author's solution

function getChessboard(size = 8) {
    var board = '';
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if ((x + y) % 2 === 0) {
                board += ' ';
            } else {
                board += '#';
            }
        }
        board += '\n';
    }
    console.log(board);
}