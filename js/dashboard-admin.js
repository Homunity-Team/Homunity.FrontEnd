//rejected properties pop-up//
function countChars() {
        let text = document.getElementById("reasonInput").value;
        document.getElementById("charCount").innerText = text.length + " / 300";
    }

    function closePopup() {
        document.querySelector(".popup-overlay").style.display = "none";
    }

    function confirmAction() {
        let text = document.getElementById("reasonInput").value;

        if (text.trim() === "") {
            alert("Please write a reason first!");
            return;
        }

        alert("Submitted Successfully!");
    }