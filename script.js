let xp = 0;
let totalXp = 0;
let luck = 0;
let lure = 0;
let luckBookCount = 0;
let lureBookCount = 0;
let rareFishCount = 0;
let uncommonFishCount = 0;
let commonFishCount = 0;
let smallFishCount = 0;
let junkCount = 0;
let legendaryFishCount = 0; // Add legendary fish count
let fishingTimeout;
let isFishing = false;
let canReelIn = false;
let reelInWindowTimeout;
let fishOnLineTime; // Track when fish is on the line

const castOrReel = () => {
    if (!isFishing) {
        castLine();
    } else {
        reelIn();
    }
}

const castLine = () => {
    document.getElementById('message').innerText = 'Casting...';
    document.getElementById('fishButton').innerText = 'Reel In';
    document.getElementById('animation').classList.remove('hidden');
    isFishing = true;
    canReelIn = false;

    const reelInTime = Math.floor(Math.random() * 5000) + 1000; // between 1 and 6 seconds

    fishingTimeout = setTimeout(() => {
        document.getElementById('animation').classList.add('hidden');
        document.getElementById('message').innerText = 'Fish on the line! Click "Reel In"!';
        canReelIn = true;
        fishOnLineTime = new Date(); // Record the time fish is on the line
        document.getElementById('animation').classList.add('sink');
        reelInWindowTimeout = setTimeout(() => {
            document.getElementById('message').innerText = 'The fish or loot got away! Cast again.';
            document.getElementById('fishButton').innerText = 'Cast Fishing Line';
            isFishing = false;
            canReelIn = false;
            document.getElementById('animation').classList.remove('sink');
        }, 2000); // 2 seconds
    }, reelInTime);
}

const reelIn = () => {
    clearTimeout(fishingTimeout);
    clearTimeout(reelInWindowTimeout);
    document.getElementById('fishButton').innerText = 'Cast Fishing Line';
    document.getElementById('animation').classList.add('hidden');
    document.getElementById('animation').classList.remove('sink');
    isFishing = false;

    if (!canReelIn) {
        document.getElementById('message').innerText = 'You reeled in too early and got nothing!';
        return;
    }

    const reactionTime = (new Date() - fishOnLineTime) / 1000; // Calculate reaction time in seconds
    const reactionMultiplier = Math.max(1, 2 - reactionTime); // Reaction multiplier with a minimum of 1

    const random = Math.random();
    let loot;
    let baseXp = 0;

    if (luck >= 2 && random < 0.01) { // Legendary Fish (1%) only if Luck Level is 2 or higher
        loot = "a Legendary Fish!";
        legendaryFishCount++;
        document.getElementById('legendaryFishCount').innerText = legendaryFishCount;
        baseXp = 50;
        showPopup("Congratulations! You caught a Legendary Fish!", "./legendaryfish.png");
    } else if (random < 0.06) { // Luck Book (6%)
        loot = "a Luck Book!";
        luckBookCount++;
        document.getElementById('luckBookCount').innerText = luckBookCount;
    } else if (random < 0.12) { // Lure Book (6%)
        loot = "a Lure Book!";
        lureBookCount++;
        document.getElementById('lureBookCount').innerText = lureBookCount;
    } else if (random < 0.20) { // Rare fish
        loot = "a rare fish!";
        rareFishCount++;
        document.getElementById('rareFishCount').innerText = rareFishCount;
        baseXp = 15;
		showPopup("Congratulations! You caught a rare Fish!", "./rarefish.png");
    } else if (random < 0.50) { // Uncommon fish
        loot = "an uncommon fish!";
        uncommonFishCount++;
        document.getElementById('uncommonFishCount').innerText = uncommonFishCount;
        baseXp = 10;
		showPopup("Congratulations! You caught a uncommon Fish!", "./uncommonfish.png");
    } else if (random < 0.80) { // Common fish
        loot = "a common fish.";
        commonFishCount++;
        document.getElementById('commonFishCount').innerText = commonFishCount;
        baseXp = 6;
		showPopup("Congratulations! You caught a common Fish!", "./commonfish.png");
        showPopup("You caught a common fish.", "./commonfish.png");
    } else if (random < 0.95) { // Small fish
        loot = "a small fish.";
        smallFishCount++;
        document.getElementById('smallFishCount').innerText = smallFishCount;
        baseXp = 4;
		showPopup("Congratulations! You caught a small Fish!", "./smallfish.png");
    } else { // Junk
        loot = "some junk.";
        junkCount++;
        document.getElementById('junkCount').innerText = junkCount;
        baseXp = 3;
    }

    const gainedXp = baseXp * (1 + luck * 0.2 + lure * 0.1) * reactionMultiplier; // Include reaction multiplier

    xp += gainedXp;
    totalXp += gainedXp;

    document.getElementById('message').innerText = `You caught ${loot} and gained ${gainedXp.toFixed(2)} XP.`;
    document.getElementById('xp').innerText = `XP: ${xp.toFixed(2)}`;
}

const upgrade = (type) => {
    const requiredXP = type === 'luck' ? 100 * (2 ** luck) : 100 * (2 ** lure); // 100 XP, doubling each upgrade
    const bookCount = type === 'luck' ? luckBookCount : lureBookCount;

    if (xp >= requiredXP && bookCount > 0) {
        if (type === 'luck') {
            luck++;
            luckBookCount--;
            document.getElementById('luck').innerText = `Luck Level: ${luck}`;
            document.getElementById('luckBookCount').innerText = luckBookCount;
        } else {
            lure++;
            lureBookCount--;
            document.getElementById('lure').innerText = `Lure Level: ${lure}`;
            document.getElementById('lureBookCount').innerText = lureBookCount;
        }
        xp -= requiredXP;
        document.getElementById('xp').innerText = `XP: ${xp.toFixed(2)}`;
        document.getElementById('totalXp').innerText = `Total XP: ${totalXp.toFixed(2)}`;
    } else {
        checkXPAndBook(requiredXP, type);
    }
}

function checkXPAndBook(requiredXP, bookType) {
    const currentXP = xp;
    const bookCount = bookType === 'luck' ? luckBookCount : lureBookCount;

    if (currentXP < requiredXP) {
        showPopup(`Not enough XP. You need ${requiredXP - currentXP} more XP.`);
    } else if (bookCount <= 0) {
        showPopup(`You must catch a ${bookType} book first.`);
    }
}

function showPopup(message, imageUrl = null) {
    const popup = document.getElementById('popup');
    popup.innerHTML = ''; // Clear previous content

    // Create a paragraph element for the message
    const messageElement = document.createElement('p');
    messageElement.textContent = message;
    popup.appendChild(messageElement);

    // If an image URL is provided, create an img element
    if (imageUrl) {
        const imageElement = document.createElement('img');
        imageElement.src = imageUrl;
        imageElement.alt = 'Fish';
        popup.appendChild(imageElement);
    }

    popup.classList.remove('hidden');
    setTimeout(() => {
        popup.classList.add('hidden');
    }, 3000);
}

function openStore() {
    document.getElementById('store').classList.remove('hidden');
    updateStore();
}

function closeStore() {
    document.getElementById('store').classList.add('hidden');
}

function updateStore() {
    const storeItems = document.getElementById('storeItems');
    storeItems.innerHTML = `
        <p>Legendary Fish: ${legendaryFishCount} - Sell for 100 XP each <button onclick="sellItem('legendary')">Sell</button></p>
        <p>Rare Fish: ${rareFishCount} - Sell for 50 XP each <button onclick="sellItem('rare')">Sell</button></p>
        <p>Uncommon Fish: ${uncommonFishCount} - Sell for 20 XP each <button onclick="sellItem('uncommon')">Sell</button></p>
        <p>Common Fish: ${commonFishCount} - Sell for 10 XP each <button onclick="sellItem('common')">Sell</button></p>
        <p>Small Fish: ${smallFishCount} - Sell for 5 XP each <button onclick="sellItem('small')">Sell</button></p>
        <p>Junk: ${junkCount} - Sell for 2 XP each <button onclick="sellItem('junk')">Sell</button></p>
    `;
}

function sellItem(itemType) {
    let xpEarned = 0;
    switch (itemType) {
        case 'legendary':
            if (legendaryFishCount > 0) {
                legendaryFishCount--;
                xpEarned = 100;
            }
            break;
        case 'rare':
            if (rareFishCount > 0) {
                rareFishCount--;
                xpEarned = 50;
            }
            break;
        case 'uncommon':
            if (uncommonFishCount > 0) {
                uncommonFishCount--;
                xpEarned = 20;
            }
            break;
        case 'common':
            if (commonFishCount > 0) {
                commonFishCount--;
                xpEarned = 10;
            }
            break;
        case 'small':
            if (smallFishCount > 0) {
                smallFishCount--;
                xpEarned = 5;
            }
            break;
        case 'junk':
            if (junkCount > 0) {
                junkCount--;
                xpEarned = 2;
            }
            break;
    }

    xp += xpEarned;
    document.getElementById('xp').innerText = `XP: ${xp.toFixed(2)}`;
    updateStore();
    updateCounts();
}

function updateCounts() {
    document.getElementById('legendaryFishCount').innerText = legendaryFishCount;
    document.getElementById('rareFishCount').innerText = rareFishCount;
    document.getElementById('uncommonFishCount').innerText = uncommonFishCount;
    document.getElementById('commonFishCount').innerText = commonFishCount;
    document.getElementById('smallFishCount').innerText = smallFishCount;
    document.getElementById('junkCount').innerText = junkCount;
}

