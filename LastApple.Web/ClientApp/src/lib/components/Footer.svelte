<script lang="ts">
	// Footer component - migrated from React
</script>

<div class="footer">
	<a href="https://apps.apple.com/app/lastream/id1483386771">
		<img src="/app-store-badge.svg" alt="App Store Badge" />
	</a>
	<div class="twitter-container">
		<a 
			class="twitter-link"
			href="https://twitter.com/vitaliykapral" 
			target="_blank" 
			rel="noopener noreferrer"
		>
			<i class="fab fa-twitter twitter-icon"></i>
			<div class="twitter-text">
				<span class="twitter-label">Reach me on</span>
				<span class="twitter-brand">Twitter</span>
			</div>
		</a>
	</div>
</div>

<style>
	.footer {
		display: flex;
		justify-content: center;
		padding: 10px 20px;
		border-top: 1px solid #404040;
	}

	.twitter-container {
		display: flex;
		align-items: center;
		width: 120px;
		padding: 2px 5px;
		margin-left: 25px;
		border: 1px solid #A6A6A6;
		border-radius: 5px;
		background: #000;
	}

	.twitter-link {
		color: #FFF;
		display: flex;
		align-items: center;
		width: 100%;
		text-decoration: none;
	}

	.twitter-icon {
		font-size: 1.5rem;
		margin-right: 5px;
		margin-left: 5px;
		color: #1ea1f2;
	}

	.twitter-text {
		display: flex;
		flex-direction: column;
		line-height: 1.2;
		align-items: center;
		flex: 1;
		font-family: 'Open Sans';
		margin-top: 3px;
	}

	.twitter-label {
		font-size: 9px;
	}

	.twitter-brand {
		font-size: 16px;
	}
</style>
