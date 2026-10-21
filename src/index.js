const levelBtn = document.querySelectorAll('.btn-level');

// Chọn level ở main menu
function levelSelection(){
    levelBtn.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selectedBtn = document.querySelector('.btn-level.active');

            if(selectedBtn && selectedBtn !== e.currentTarget) {
                selectedBtn.classList.remove('active');
                e.currentTarget.classList.add('active');
            } else if(!selectedBtn){
                e.currentTarget.classList.add('active');
            }
        })
    })
}
levelSelection();
