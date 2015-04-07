/*
/* Katie Hadgis, CS452, Project 1, 04/07/15
/* 
/* Game Rules:
/*    - You control the black square
/*	  - Move using arrows keys
/*	  - Try and get the colored squares (fruits)
/*	  - Each color is worth a different amount of points
/*	  - Avoid the falling grey squares (rain) or else game over!
/*
/* Notes: 
/*	  - Model view matrix indicates when player is attempting to move out of bounds.
/*	  - Game reset doesn't work very well, refresh to start a new game for best results.
/* */
var canvas;
var gl;

var program, program2;
var cBuffer, buffer2, bufferId; // is accessed outside of onload
var modelViewMatrix = [];
var modelViewMatrix2 = [];
var projectionMatrix = [];
var verts2 = [], verts = [];
var num_objects = 0;
var intScore = 0, strScore = 0;
var xcam = 0, ycam = 0;
var xtrans = [0.0, 0.0, 0.0]; //player, fruit xtrans. initRain() adds more elements
var ytrans = [0.0, 0.0, 0.0]; //player, fruit ytrans. initRain() adds more elements
var current_color, object_colors = [];
var xtransLoc, ytransLoc, colorLoc;

var m = 1; // player direction indicator

var axisBool = true; // x=true, y=false
var generateFruit = true; // should a new fruit color/value be created? true = yes
var play = false; // !play = paused game

var f = 0;

const s = 0.05; // quad size
const b = 1; // background size
const fruit_colors = [
		vec4(.75,0,0,1),				//red	
		vec4(0.9,0.5,0,1),				//orange
		vec4(0.95,0.9,0,1),				//yellow
		vec4(0,0.5882,0,1),				//green	
		vec4(0.2941,0.5882,0.7843,1),	//blue
		vec4(0.5882,0.2941,.5882,1),	//purple
	];
const fruit_values = [10,25,50,125,250,500];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.2, 0.2, 0.2, 1.0 );
	
//INIT VERTS

	verts2[0]=( vec2( b , b ));
	verts2[1]=( vec2( b , -b ));
	verts2[2]=( vec2( -b , b ));
	verts2[3]=( vec2( -b , -b ));

	verts[0]=( vec2( s , s ));
	verts[1]=( vec2( s , -s ));
	verts[2]=( vec2( -s , s ));
	verts[3]=( vec2( -s , -s ));

	newFruit();
	num_objects = Math.floor(verts.length/4);

	strScore = "Score: " + strScore;
	document.getElementById("score").innerHTML = strScore;

//BACKGROUND PROGRAM
//  Load shaders and initialize attribute buffers
    program2 = initShaders( gl, "vertex-shader2", "fragment-shader2" );
    gl.useProgram( program2 );

	// Background Vert Buffer
    buffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, buffer2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verts2), gl.STATIC_DRAW );
	
	var vPosition2 = gl.getAttribLocation( program2, "vPosition2" );
    gl.vertexAttribPointer( vPosition2, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition2 );

//PLAYER PROGRAM	
	//  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
	xtransLoc = gl.getUniformLocation( program, "UXtrans" );
	ytransLoc = gl.getUniformLocation( program, "UYtrans" );
	
	// Player Vert Buffer
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(verts), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

	cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    //gl.bufferData( gl.ARRAY_BUFFER, flatten(current_color), gl.STATIC_DRAW );
		//load color data in render function, as it may change.
	
	var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
	


//KEY EVENTS	
	document.getElementById("ButtonT").onclick = function(){play = !play;};
	document.onkeydown = function(e) {
		switch (e.keyCode) {
			case 37:
				//left
				axisBool = true;
				m = -1;
				break;
			case 38:
				//up
				axisBool = false;
				m = 1;
				break;
			case 39:
				//right
				axisBool = true;
				m = 1;
				break;
			case 40:
				//down
				axisBool = false;
				m = -1;
				break;
		}
	};

    render();		
};
function initRain(){

		verts.push( vec2( s , s ));
		verts.push( vec2( s , -s ));
		verts.push( vec2( -s , s ));
		verts.push( vec2( -s , -s ));
		xtrans.push( Math.random()* (1 - (-1)) + -1);
		ytrans.push(1 + s);
		++num_objects;
	
}
function newFruit(){
	//while xfruit and xplayer dont overlap && yfruit and yplayer dont overlap
	while( xtrans[1] >= xtrans[2] - s && xtrans[1] <= xtrans[2] + s && 
			ytrans[1] >= ytrans[2] - s && ytrans[1] <= ytrans[2] + s
	){
		xtrans[2] = Math.random()* (1 - (-1)) + -1; 
		ytrans[2] = Math.random()* (1 - (-1)) + -1;
	}
}
function getColor(c){
	var new_color;
	var color_array = [];
	if (c==1) new_color = vec4(0.0,0.0,0.0,1.0);
	else if (c==2){
		if (generateFruit){
			var rand = Math.random();
			if(rand>=0.5) ifruit = 0;
			else if(rand>=0.25) ifruit = 1;
			else if(rand>=0.125) ifruit = 2;
			else if(rand>=0.0625) ifruit = 3;
			else if(rand>=0.03125) ifruit = 4;
			else ifruit = 5;
			generateFruit = false;
		}
		new_color = fruit_colors[ifruit];

	}
	else new_color = vec4(0.7,0.7,0.7,1.0); //if it isnt the player or fruit, it must be rain.
	for (var i=0; i<6; ++i){
		color_array[i] = new_color;
	}
	
	return color_array;
}

function render() {

	gl.clear( gl.COLOR_BUFFER_BIT );

	gl.useProgram( program2 );
	gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	
	gl.useProgram( program );
	
// animation & collisions detection
	if(play){
		strScore = "Score: " + intScore;
		document.getElementById("score").innerHTML = strScore;
		
		//reset MVM
		modelViewMatrix = mat4(); // inits as identity

		// if player collides with rain
		for(var i=3; i<num_objects; i++){
			if(  xtrans[1] >= xtrans[i] - s && xtrans[1] <= xtrans[i] + s && 
				ytrans[1] >= ytrans[i] - s && ytrans[1] <= ytrans[i] + s ){

				//display game over and pause
				strScore = "Score: " + intScore + "<br/>Game Over!";
				document.getElementById("score").innerHTML = strScore;
				play = false;

				//reset vars after
				intScore = 0;
				
			}
		}

		// if player collides with fruit:
		if( xtrans[1] >= xtrans[2] - s && xtrans[1] <= xtrans[2] + s && 
			ytrans[1] >= ytrans[2] - s && ytrans[1] <= ytrans[2] + s){
				//fruit obtained, update score:
				intScore += fruit_values[ifruit];
				strScore = "Score: " + intScore;
				document.getElementById("score").innerHTML = strScore;
				
				//get new fruit color
				generateFruit = true;
				//create fruit obj
				newFruit();
			
			
		}
		// move player based on keypress:
		if(axisBool && m==1 && xtrans[1] < 1-s) {
			xtrans[1] += m * 0.01;
			ycam = 0;
			xcam = 0;
		}
		else if(axisBool && m==-1 && xtrans[1] > -1+s) {
			xtrans[1] += m * 0.01;
			ycam = 0;
			xcam = 0;
		}
		else if(!axisBool && m==1 && ytrans[1] < 1-s) {
			ytrans[1] += m * 0.01;
			xcam = 0;
			ycam = 0;
		}
		else if(!axisBool && m==-1 && ytrans[1] > -1+s) {
			ytrans[1] += m * 0.01;
			xcam = 0;
			ycam = 0;
		}
		else if(axisBool && xcam < s && xcam > -s){
			xcam -= m * 0.01;
			ycam = 0;
		}
		else if(!axisBool && ycam < s && ycam > -s){
			ycam -= -m * 0.01;
			xcam = 0;
		}
		else{
			console.log("WEIRD ERROR!!");
		}
		modelViewMatrix = mult(modelViewMatrix, translate([ xcam, ycam, 0 ]));
		modelViewMatrix2 = modelViewMatrix;
		//console.log(xcam, ycam);
		gl.uniformMatrix4fv( gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix) );
		gl.useProgram( program2 );
		gl.uniformMatrix4fv( gl.getUniformLocation(program2, "modelViewMatrix"), false, flatten(modelViewMatrix2) );
		gl.useProgram( program );
		
		// animate rainfall:
		for(var i=3;i<num_objects;++i){
			if(ytrans[i]<-1){
				xtrans[i] = Math.random()* (1 - (-1)) + -1;
				ytrans[i] = 1 + s;
			}
			else ytrans[i] -= 0.04;
		}
		if(f<=300){
			
			if(f==100){
				initRain();
			}
			else if(f==125){
				initRain();
			}
			else if(f==150){
				initRain();
			}
			else if(f==175){
				initRain();
			}
			else if(f==200){
				initRain();
			}
			else if(f==225){
				initRain();
			}

		}
	}
		
//render player
		gl.uniform1f( xtransLoc, xtrans[1] );
		gl.uniform1f( ytransLoc, ytrans[1] );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(getColor(1)), gl.STATIC_DRAW );
		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

//render fruit
		gl.uniform1f( xtransLoc, xtrans[2] );
		gl.uniform1f( ytransLoc, ytrans[2] );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(getColor(2)), gl.STATIC_DRAW );
		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

//render rain
	for(var i=3;i<num_objects;++i){
		gl.uniform1f( xtransLoc, xtrans[i] );
		gl.uniform1f( ytransLoc, ytrans[i] );
		gl.bufferData( gl.ARRAY_BUFFER, flatten(getColor(i)), gl.STATIC_DRAW );
		gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );
	}
	

    window.requestAnimFrame(render);
	f=f+1;
}
