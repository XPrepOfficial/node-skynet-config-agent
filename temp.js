function skipKill(count) {
    let gunWithIdx = 0;
    const workArr = [];
    for (let i = 1; i <= count; i++) workArr.push(i);
    while (workArr.length > 1) {
        workArr.splice(workArr[gunWithIdx + 1] ? gunWithIdx + 1 : 0, 1);
        gunWithIdx = workArr[gunWithIdx + 1] ? gunWithIdx + 1 : 0;
    }
    return workArr.shift();
}

[100, 10000, 50, 51, 10, 20, 70].forEach(count => console.log('Survivor is', skipKill(count), 'in the ring of', count));
