
const queue = [];

function skip(amount) {
    queue.splice(0, amount);
}
function next() {
    return queue.shift();
}

function enqueue(array) {
    queue.push(...array);
}

function view() {
    return [ ...queue ];
}

function length() {
    return queue.length;
}

module.exports = {
    next, enqueue, skip, view, length
};