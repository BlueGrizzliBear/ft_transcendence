import consumer from "../../channels/consumer"
import * as GC from './garbage_collector';

const LEFT_UP_KEY = "w";
const LEFT_DOWN_KEY = "s";
const RIGHT_UP_KEY = "ArrowUp";
const RIGHT_DOWN_KEY = "ArrowDown";
const timerColors = {
	3: 'green',
	2: 'orange',
	1: 'red'
};
const minAngle = {
	x: 0.984,
	y: 0.174
};
const maxAngle = {
	x: 0.342,
	y: 0.939
};
const angleIncrement = {
	x: (minAngle.x - maxAngle.x) / 100.0,
	y: (maxAngle.y - minAngle.y) / 100.0
};
const baseBallSpeed = 0.0025;
const paddleSpeed = 0.008;

let lastPreviousBallUpdate = null;
let paddleIsActive = false;
let ballSpeed = baseBallSpeed;

let ballHandler = {
	interval: null,
	direction: {x: -1, y: -1}
};
let leftPaddleHandler = {
	up: {
		interval: null,
		handler: movePaddleUp
	},
	down: {
		interval: null,
		handler: movePaddleDown
	}
};
let rightPaddleHandler = {
	up: {
		interval: null,
		handler: movePaddleUp
	},
	down: {
		interval: null,
		handler: movePaddleDown
	}
};

let $gameArea, $ball, $leftPoints, $rightPoints, $timer;
let paddleHeight, paddleTopLimit, paddleBottomLimit, leftPaddleLimit, rightPaddleLimit;
let ballRadius, ballTopLimit, ballBottomLimit, ballLeftLimit, ballRightLimit;

let pongSubscription;

function resetAllKeys() {
	resetKey(leftPaddleHandler, 'up');
	resetKey(leftPaddleHandler, 'down');
	resetKey(rightPaddleHandler, 'up');
	resetKey(rightPaddleHandler, 'down');
}

function resetKey(paddleHandler, direction) {
	pongSubscription.send({
		'act': 'release',
		'dir': direction,
		'side': paddleHandler == leftPaddleHandler ? 'left' : 'right'
	});
}

function switchKey(e, paddleHandler, oldDir, newDir) {
	e.preventDefault();
	if (!paddleIsActive || paddleHandler[newDir].interval != null)
		return ;
	pongSubscription.send({
		'act': 'press',
		'dir': newDir,
		'side': paddleHandler == leftPaddleHandler ? 'left' : 'right'
	});
	pongSubscription.send({
		'act': 'release',
		'dir': oldDir,
		'side': paddleHandler == leftPaddleHandler ? 'left' : 'right'
	});
}

function resetPaddle(paddleHandler, direction) {
	GC.cleanInterval(paddleHandler[direction].interval);
	paddleHandler[direction].interval = null;
}

function activatePaddle(paddleHandler, direction) {
	paddleHandler[direction].interval = GC.addInterval(function() {
		paddleHandler[direction].handler(paddleHandler.$paddle);
	}, 1);
}

function keyDownHandler(e) {
	if (e.key == RIGHT_UP_KEY)
		switchKey(e, rightPaddleHandler, 'down', 'up');
	else if (e.key == RIGHT_DOWN_KEY)
		switchKey(e, rightPaddleHandler, 'up', 'down');
	else if (e.key == LEFT_UP_KEY)
		switchKey(e, leftPaddleHandler, 'down', 'up');
	else if (e.key == LEFT_DOWN_KEY)
		switchKey(e, leftPaddleHandler, 'up', 'down');
}

function keyUpHandler(e) {
	if (e.key == RIGHT_UP_KEY)
		resetKey(rightPaddleHandler, 'up');
	else if (e.key == RIGHT_DOWN_KEY)
		resetKey(rightPaddleHandler, 'down');
	else if (e.key == LEFT_UP_KEY)
		resetKey(leftPaddleHandler, 'up');
	else if (e.key == LEFT_DOWN_KEY)
		resetKey(leftPaddleHandler, 'down');
}

function movePaddleUp($paddle) {
	const position = Number($paddle.position().top / $gameArea.height());
	const topPosition = Math.max(position - paddleSpeed, paddleTopLimit);
	$paddle.css({top: (topPosition * 100) + '%'});
}

function movePaddleDown($paddle) {
	const position = Number($paddle.position().top / $gameArea.height());
	const topPosition = Math.min(position + paddleSpeed, paddleBottomLimit);
	$paddle.css({top: (topPosition * 100) + '%'});
}

function moveBall() {
	//console.log('moving ball');
	const oldPosition = {
		top: Number($ball.position().top / $gameArea.height()),
		left: Number($ball.position().left / $gameArea.width())
	};
	const newPosition = {
		top: oldPosition.top + ballHandler.direction.y * ballSpeed,
		left: oldPosition.left + ballHandler.direction.x * ballSpeed
	};
	if (newPosition.top <= ballTopLimit || newPosition.top >= ballBottomLimit)
		ballHandler.direction.y *= -1.0;
	else if (ballMeetsPaddle(newPosition))
		ballSpeed *= 1.15;
	else if (newPosition.left <= ballLeftLimit || newPosition.left >= ballRightLimit)
		scorePoint(newPosition.left <= ballLeftLimit);
	else
	{
		if ((new Date()).getTime() - lastPreviousBallUpdate >= 100)
		{
			const $previousBall = $ball.clone();
			$previousBall.css({opacity: 0.6});
			$gameArea.append($previousBall);
			const interval = GC.addInterval(function() {
				$previousBall.css({opacity: $previousBall.css('opacity') - 0.2});
			}, 100);
			GC.addTimeout(function() {
				GC.cleanInterval(interval);
				$previousBall.remove();
			}, 300);
			lastPreviousBallUpdate = (new Date()).getTime();
		}
		$ball.css({
			top: (newPosition.top * 100) + '%',
			left: (newPosition.left * 100) + '%'
		});
	}
}

function timerAndStart() {
	$timer.show();
	$timer.text('3');
	$timer.css({color: 'green'});
	const interval = GC.addInterval(function() {
		$timer.text(Math.max(Number($timer.text()) - 1, 1));
		$timer.css({color: timerColors[$timer.text()]});
	}, 1000);
	GC.addTimeout(function() {
		GC.cleanInterval(interval);
		$timer.hide();
		start();
	}, 3000);
}

function scorePoint(leftSide) {
	paddleIsActive = false;
	resetAllKeys();
	GC.cleanInterval(ballHandler.interval);
	reset();
	if (leftSide)
		$rightPoints.text(Number($rightPoints.text()) + 1);
	else
		$leftPoints.text(Number($leftPoints.text()) + 1);
}

function changeBallDirection(distBallPaddleCenter, xSign)
{
	const oldDirectionWasNegative = ballHandler.direction.y < 0;
	ballHandler.direction = {
		x: xSign * (minAngle.x - angleIncrement.x * distBallPaddleCenter),
		y: minAngle.y + angleIncrement.y * distBallPaddleCenter
	};
	if (oldDirectionWasNegative)
		ballHandler.direction.y *= -1.0;
	return (true);
}

function ballMeetsPaddle(ballPosition) {
	const bottomOfBallPosition = ballPosition.top + ballRadius;
	const topOfBallPosition = ballPosition.top - ballRadius;
	const leftPaddlePosition = leftPaddleHandler.$paddle.position().top / $gameArea.height();
	const rightPaddlePosition = rightPaddleHandler.$paddle.position().top / $gameArea.height();
	if (ballHandler.direction.x < 0.0
	&& ballPosition.left - ballRadius <= leftPaddleLimit
	&& bottomOfBallPosition >= leftPaddlePosition - paddleHeight / 2.0
	&& topOfBallPosition <= leftPaddlePosition + paddleHeight / 2.0)
		return (changeBallDirection(100 * Math.abs(leftPaddlePosition - ballPosition.top) / (paddleHeight / 2.0),
				1));
	else if (ballHandler.direction.x > 0.0
	&& ballPosition.left + ballRadius >= rightPaddleLimit
	&& bottomOfBallPosition >= rightPaddlePosition - paddleHeight / 2.0
	&& topOfBallPosition <= rightPaddlePosition + paddleHeight / 2.0)
		return (changeBallDirection(100 * Math.abs(rightPaddlePosition - ballPosition.top) / (paddleHeight / 2.0),
				-1));
	return (false);
}

function defineJqueryObjects() {
	$gameArea = $('#game_area');
	$ball = $('#ball_container');
	$leftPoints = $('#player_infos_left .score');
	$rightPoints = $('#player_infos_right .score');
	$timer = $('#timer');

	leftPaddleHandler.$paddle = $('#paddle_left_container');
	rightPaddleHandler.$paddle = $('#paddle_right_container');

	paddleHeight = leftPaddleHandler.$paddle.height() / $gameArea.height();
	paddleTopLimit = paddleHeight / 2.0;
	paddleBottomLimit = 1.0 - paddleTopLimit;
	leftPaddleLimit = leftPaddleHandler.$paddle.width() / $gameArea.width();
	rightPaddleLimit = 1.0 - leftPaddleLimit;
	ballRadius = ($ball.width() / $gameArea.width()) / 2.0;
	ballTopLimit = ballRadius;
	ballBottomLimit = 1.0 - ballRadius;
	ballLeftLimit = ballRadius;
	ballRightLimit = 1.0 - ballRadius;
}

function start() {
	leftPaddleHandler.$paddle.css({top: '50%'});
	rightPaddleHandler.$paddle.css({top: '50%'});
	paddleIsActive = true;
	$ball.show();
	const randIncrement = Math.random() * 100;
	ballHandler.direction = {
		x: (Math.floor(Math.random() * 100) % 2 ? 1 : -1)
			* (minAngle.x - angleIncrement.x * randIncrement),
		y: (Math.floor(Math.random() * 100) % 2 ? 1 : -1)
			* (minAngle.y + angleIncrement.y * randIncrement)
	};
	$ball.css({
		top: '50%',
		left: '50%'
	});
	lastPreviousBallUpdate = (new Date()).getTime();
	//ballHandler.interval = GC.addInterval(moveBall, 1);
	ballSpeed = baseBallSpeed;
	GC.addInterval(function() {
		pongSubscription.send({
			"request": "ballPosition"
		});
	}, 100);
}

function updateBallFromServer(ball) {
	$ball.css({
		top: ball.top + '%',
		left: ball.left + '%'
	});
}

export function connect() {
	defineJqueryObjects();
	$(document).keydown(keyDownHandler);
	$(document).keyup(keyUpHandler);

	pongSubscription = consumer.subscriptions.create("PongChannel", {
		connected() {
			// Called when the subscription is ready for use on the server
			console.log('connected to pong channel');
			pongSubscription.send({message: "connected to PongChannel (from client)"});
			//reset();
		},
	
		disconnected() {
			// Called when the subscription has been terminated by the server
			console.log('disconnected from pong channel');
		},
	
		received(data) {
			// Called when there's incoming data on the websocket for this channel
			console.log('Received data from pong channel : ', data.content);
			if (data.content['act'] == "start")
				timerAndStart();
			else if (data.content['act'] == 'press' || data.content['act'] == 'release')
				enemyMove(data.content);
			else if (data.content['ball'])
				updateBallFromServer(data.content['ball']);
			else
				console.log('Error: unrecognized data');
		}
	});
}

function enemyMove(data) {
	const paddleHandler = data.side == 'left' ? leftPaddleHandler : rightPaddleHandler;
	if (data.act == 'press') {
		resetPaddle(paddleHandler, data.dir == 'up' ? 'down' : 'up');
		activatePaddle(paddleHandler, data.dir);
	}
	else if (data.act == 'release')
		resetPaddle(paddleHandler, data.dir);
}

function getBallPosition() {
	pongSubscription.send({
		"request": "ballPosition"
	});
}