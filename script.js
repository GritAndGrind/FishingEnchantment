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
