cssColors = new function() {
		
	var $this = this;
	
	var colorAttributes = [
		'color',
		'background-color',
		'border-color',
		'border-top-color',
		'border-right-color',
		'border-bottom-color',
		'border-left-color'
	];
	
	var rules = {};
	
	this.init = function()
	{
	};
	
	var _lastCheck = 0;
	this.loadStyleSheets = function()
	{
		var time = Math.round(new Date().getTime() / 1000);
		
		if (time - _lastCheck < 5)
		{
			_lastCheck = time;
			//return;
		}
		
		_lastCheck = time;
		
		rules =
			{
				byAttribute: {},
				bySelector: {},
				unSorted: []
			};
			
		if ($("#cssRulesTmp").length > 0)
		{
			$(document.styleSheets).each(function() {
				if ($(this).attr("title")=="cssRulesTmp")
				{
					$this.loadStyleSheet(this);
				}
			});
		}
		else
		{
			$(document.styleSheets).each($this.loadStyleSheet);
		}
	};
	
	this.loadStyleSheet = function(stylesheet)
	{
		if ( ! isNaN(stylesheet))
		{
			stylesheet = document.styleSheets[stylesheet];
		}
		
		if ($(stylesheet).attr("type") != 'text/css')
		{
			return;
		}
		
		if (stylesheet.rules == null || stylesheet.rules.length == 0)
		{
			return;
		}
		
		for (var i=0;i<stylesheet.rules.length;i++)
		{
			$this.loadRule(stylesheet.rules[i]);
		}
	};
	
	this.loadRule = function(rule)
	{
		if (rules.bySelector[rule.selectorText] == undefined)
		{
			rules.bySelector[rule.selectorText] = [];
		}
		
		rules.bySelector[rule.selectorText].push(rule);
		rules.unSorted.push(rule);
		
		var declarations = rule.style.cssText.match(/([a-z-]*?)\:(.*?)\;/gi);
		if ( ! declarations)
		{
			return;
		}
		
		for (var i=0;i<declarations.length;i++)
		{
			var declaration = declarations[i];
			var parsed 		= declaration.match(/([a-z-]*?)\:(.*?)\;/i);
			
			if ( ! parsed)
			{
				continue;
			}
			
			var declaration = $.trim(parsed[1]);
			var value = $.trim(parsed[2]);
			
			if (rules.byAttribute[declaration] == undefined)
			{
				rules.byAttribute[declaration] = [];
			}
			
			rules.byAttribute[declaration].push({
				rule: rule,
				value: value
			});
		}
	};
	
	var _rules = [];
	this.writeRule = function(selector, declaration, value)
	{
		_rules.push(selector + " { "+declaration+": "+value+"; }");
		$this.writeStyle();
	};
	
	this.clearRules = function()
	{
		_rules = [];
		$("#cssRulesTmp").remove();
	};
	
	this.writeStyle = function()
	{
		var style = $("<style>").attr({id: "cssRulesTmp",type: "text/css", title: "cssRulesTmp"});
		
		for (var i=0;i<_rules.length;i++)
			style.append(_rules[i]);
			
		$("#cssRulesTmp").remove();
		style.appendTo("head");
	};
	
	this.each = function(callback)
	{
		$this.loadStyleSheets();
		$this.clearRules();
		
		for (var i=0;i<colorAttributes.length;i++)
		{
			var declaration = colorAttributes[i];
			if (rules.byAttribute[declaration] == undefined)
			{
				continue;
			}
			
			for (var x=0;x<rules.byAttribute[declaration].length;x++)
			{
				var rule  = rules.byAttribute[declaration][x];
				callback(rule);
				$this.writeRule(rule.rule.selectorText, declaration, rule.value);
			}
		}
	};
	
	this.invert = function()
	{
		$this.each(function(rule)
		{
			var color = new RGBColor(rule.value);
			
			var r = 255 - color.r;
			var g = 255 - color.g;
			var b = 255 - color.b;
			
			color = 'rgb('+r+','+g+','+b+')';
			
			rule.value = color;
		});
	};
	
	this.setBrightness = function(amount)
	{
		$this.each(function(rule)
		{
			console.log('x');
			var color = new RGBColor(rule.value);
			
			var c = {r: 0, g: 0, b: 0};
			
			for (var k in c)
			{
				c[k] = Math.max(Math.min(color[k] + amount, 255), 0);
			}
			
			color = 'rgb('+c.r+','+c.g+','+c.b+')';
			
			console.log(color);
			
			rule.value = color;
		});
	};
	
	this.reset = function()
	{
		$this.clearRules();
		$this.loadStyleSheets();
	};
	
	$(document).ready(this.init);
	
}