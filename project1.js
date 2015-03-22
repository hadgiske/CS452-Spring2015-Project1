var canvas;
var gl;

var xtrans = 0, ytrans = 0;
var xtransLoc, ytransLoc;

var m=1;

var axisBool = true; //x=true, y=false
var fruitBool = false;
var flag = false;

const s = 0.025;
const fruit_colors = [
		vec4(255,0,0,255),		
		vec4(220,100,0,255),	
		vec4(220,180,0,255),	
		vec4(0,150,0,255),		
		vec4(75,150,200,255),	
		vec4(150,75,0,150),		
	];
const fruit_values = [10,25,50,125,250,500];
var xfruit, yfruit, ifruit; //fruit pos x, fruit pos y, fruit color/value indicator
var fruit_verts = [vec2(0,0),vec2(0,0),vec2(0,0),vec2(0,0),vec2(0,0),vec2(0,0)];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

//INIT VERTS
    var player_verts = [
        vec2(  s,  s ),
        vec2(  s,  -s ),
        vec2( -s,  s ),
        vec2(  -s, -s )
    ];

	generateFruit();

//PLAYER PROGRAM	
	//  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "player-vertex-shader", "player-fragment-shader" );
    gl.useProgram( program );
	
	xtransLoc = gl.getUniformLocation( program, "xtrans" );
	ytransLoc = gl.getUniformLocation( program, "ytrans" );
	
	//Player Vert Buffer
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(player_verts), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    
	
	
//FRUIT PROGRAM	
	var program2 = initShaders( gl, "fruit-vertex-shader", "fruit-fragment-shader" );
    gl.useProgram( program2 );
	
	//Fruit Vert Buffer
    var fruitBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fruitBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(fruit_verts), gl.STATIC_DRAW );

    var vFruitPosition = gl.getAttribLocation( program2, "vFruitPosition" );
    gl.vertexAttribPointer( vFruitPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vFruitPosition );
	
//KEY EVENTS	
	document.getElementById("ButtonT").onclick = function(){flag = !flag;};
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

function generateFruit(){
	//generate random position for fruit
	xfruit = Math.random(), yfruit = Math.random();
	
	//adapt to vert coords
	fruit_verts = [
		vec2( xfruit+(s/2) , yfruit+(s/2) ),
		vec2( xfruit+(s/2) , yfruit-(s/2) ),
		vec2( xfruit-(s/2) , yfruit+(s/2) ),
		vec2( xfruit-(s/2) , yfruit-(s/2) )
	];
	
	//generate random weighted color&value indicator for fruit
	if(Math.random()>=0.5) ifruit = 0;
	else if(Math.random()>=0.25) ifruit = 1;
	else if(Math.random()>=0.125) ifruit = 2;
	else if(Math.random()>=0.0625) ifruit = 3;
	else if(Math.random()>=0.03125) ifruit = 4;
	else current_color = ifruit = 5;
	
	console.log(xfruit,yfruit,ifruit);
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT );
	if(flag){
		if(axisBool){
			xtrans += m * .01;
		}
		else{
			ytrans += m * .01;
		}
	}
    gl.uniform1f( xtransLoc, xtrans );
	gl.uniform1f( ytransLoc, ytrans );
	
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    window.requestAnimFrame(render);
}
