// ========== 配置项（可修改这里！） ==========
const CORRECT_PASSWORD = "5201314"; // 你的专属密码
const LOGIN_KEEP_HOURS = 24;        // 登录状态保存时长（小时）
const startDate = new Date(2025, 3, 14); // 相识日期：年,月-1,日

// ========== DOM元素获取 ==========
const loginMask = document.getElementById('loginMask');
const mainCard = document.getElementById('mainCard');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const errorTip = document.getElementById('errorTip');
const letterBox = document.getElementById('letterBox');
const letterEnvelope = document.getElementById('letterEnvelope');
const letterContent = document.getElementById('letterContent');
const letterClose = document.getElementById('letterClose');
const letterText = document.getElementById('letterText');

// ========== 1. 登录验证逻辑 ==========
function checkLoginStatus() {
    const loginInfo = localStorage.getItem('lovePageLogin');
    if (!loginInfo) return false;
    const { expireTime } = JSON.parse(loginInfo);
    if (Date.now() < expireTime) {
        loginMask.style.display = 'none';
        showLetterAndCard();
        return true;
    }
    localStorage.removeItem('lovePageLogin');
    return false;
}
function verifyPassword() {
    const inputPwd = passwordInput.value.trim();
    if (inputPwd === CORRECT_PASSWORD) {
        errorTip.style.display = 'none';
        loginMask.style.display = 'none';
        showLetterAndCard();
        if (LOGIN_KEEP_HOURS > 0) {
            const expireTime = Date.now() + LOGIN_KEEP_HOURS * 60 * 60 * 1000;
            localStorage.setItem('lovePageLogin', JSON.stringify({ expireTime }));
        }
    } else {
        errorTip.style.display = 'block';
        passwordInput.value = '';
        setTimeout(() => errorTip.style.display = 'none', 2000);
    }
}
// ✅ 核心：每次登录必弹信件
function showLetterAndCard() {
    letterBox.style.display = 'block'; // 显示信件
    mainCard.style.display = 'none';   // 先隐藏主界面
    letterText.innerHTML = LETTER_CONTENT; // 加载信件内容
}

// ========== 2. 元旦信件开合逻辑 ==========
letterEnvelope.addEventListener('click', () => {
    letterEnvelope.style.display = 'none';
    letterContent.style.display = 'block';
});
letterClose.addEventListener('click', () => {
    letterBox.style.display = 'none';
    mainCard.style.display = 'block'; // 关闭信件后显示计时界面
});

// ========== 3. 相识计时逻辑 ==========
function calculateLoveTime() {
    const now = new Date();
    const diff = now - startDate;
    const totalSeconds = Math.floor(diff / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const years = Math.floor(totalDays / 365);
    const remainingDays = totalDays % 365;
    const months = Math.floor(remainingDays / 30);
    const days = remainingDays % 30;
    const hours = Math.floor(totalHours % 24);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.floor(totalSeconds % 60);

    document.getElementById('years').textContent = years.toString().padStart(2, '0');
    document.getElementById('months').textContent = months.toString().padStart(2, '0');
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// ========== 4. 星空爱心粒子效果 ==========
class Particle {
    constructor(canvas, ctx) {
        this.canvas = canvas; this.ctx = ctx;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 6 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.isHeart = Math.random() > 0.7; // 30%爱心，70%星星
        this.color = this.isHeart ? `rgba(${248}, ${201}, ${255}, ${Math.random()*0.8+0.2})` 
                                  : `rgba(${255}, ${255}, ${255}, ${Math.random()*0.7+0.3})`;
    }
    draw() {
        this.ctx.fillStyle = this.color;
        if (this.isHeart) { // 绘制爱心
            this.ctx.save(); this.ctx.translate(this.x, this.y);
            this.ctx.beginPath();
            this.ctx.moveTo(0,0);
            this.ctx.bezierCurveTo(this.size,-this.size/2,this.size*2,this.size/2,0,this.size*1.5);
            this.ctx.bezierCurveTo(-this.size*2,this.size/2,-this.size,-this.size/2,0,0);
            this.ctx.fill(); this.ctx.restore();
        } else { // 绘制星星
            this.ctx.beginPath();
            for(let i=0;i<5;i++){
                this.ctx.lineTo(Math.cos((18+i*72)*Math.PI/180)*this.size+this.x,
                                Math.sin((18+i*72)*Math.PI/180)*this.size+this.y);
                this.ctx.lineTo(Math.cos((54+i*72)*Math.PI/180)*this.size/2+this.x,
                                Math.sin((54+i*72)*Math.PI/180)*this.size/2+this.y);
            }
            this.ctx.closePath(); this.ctx.fill();
        }
    }
    update() {
        this.x += this.speedX; this.y += this.speedY;
        if(this.x<0||this.x>this.canvas.width) this.x = Math.random()*this.canvas.width;
        if(this.y<0||this.y>this.canvas.height) this.y = Math.random()*this.canvas.height;
    }
}
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const particles = [];
    const count = Math.floor((canvas.width*canvas.height)/12000);
    for(let i=0;i<count;i++) particles.push(new Particle(canvas,ctx));
    function animate() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        particles.forEach(p=>{p.update();p.draw();});
        requestAnimationFrame(animate);
    }
    animate();
    // 点击生成粒子彩蛋
    canvas.addEventListener('click', e=>{
        for(let i=0;i<15;i++){
            const p = new Particle(canvas,ctx);
            p.x=e.clientX; p.y=e.clientY;
            p.speedX=(Math.random()-0.5)*2; p.speedY=(Math.random()-0.5)*2;
            particles.push(p);
        }
    });
}

// ========== 事件绑定 & 初始化 ==========
window.onload = () => {
    initParticles(); // 初始化星空粒子
    if (!checkLoginStatus()) {
        loginMask.style.display = 'flex';
        mainCard.style.display = 'none';
        letterBox.style.display = 'none';
    }
};
loginBtn.addEventListener('click', verifyPassword);
passwordInput.addEventListener('keydown', e=>{if(e.key==='Enter') verifyPassword();});
calculateLoveTime(); setInterval(calculateLoveTime, 1000);
