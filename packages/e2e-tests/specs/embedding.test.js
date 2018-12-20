/**
 * WordPress dependencies
 */
import {
	clickBlockAppender,
	createNewPost,
	createEmbeddingMatcher,
	setUpResponseMocking,
	createJSONResponse,
	getEditedPostContent,
	clickButton,
	activatePlugin,
	deactivatePlugin,
	publishPost,
} from '@wordpress/e2e-test-utils';

const MOCK_EMBED_WORDPRESS_SUCCESS_RESPONSE = {
	url: 'https://wordpress.org/gutenberg/handbook/block-api/attributes/',
	html: '<div class="wp-embedded-content" data-secret="shhhh it is a secret">WordPress embed</div>',
	type: 'rich',
	provider_name: 'WordPress',
	provider_url: 'https://wordpress.org',
	version: '1.0',
};

const MOCK_EMBED_RICH_SUCCESS_RESPONSE = {
	url: 'https://twitter.com/notnownikki',
	html: '<p>Mock success response.</p>',
	type: 'rich',
	provider_name: 'Twitter',
	provider_url: 'https://twitter.com',
	version: '1.0',
};

const MOCK_EMBED_REDDIT_SUCCESS_RESPONSE = {
	url: 'https://www.reddit.com/r/stevenuniverse/comments/8x2lsy/after_a_few_months_of_work_i_finally_finished/',
	html: '<p>Mock success response.</p>',
	type: 'rich',
	provider_name: 'Reddit',
	provider_url: 'https://reddit.com',
	version: '1.0',
};

const MOCK_EMBED_VIDEO_SUCCESS_RESPONSE = {
	url: 'https://www.youtube.com/watch?v=lXMskKTw3Bc',
	html: '<iframe width="16" height="9"></iframe>',
	type: 'video',
	provider_name: 'YouTube',
	provider_url: 'https://youtube.com',
	version: '1.0',
};

const MOCK_BAD_EMBED_PROVIDER_RESPONSE = {
	url: 'https://twitter.com/thatbunty',
	html: false,
	provider_name: 'Embed Provider',
	version: '1.0',
};

const MOCK_CANT_EMBED_RESPONSE = {
	provider_name: 'Embed Handler',
	html: '<a href="https://twitter.com/wooyaygutenberg123454312">https://twitter.com/wooyaygutenberg123454312</a>',
};

const MOCK_BAD_WORDPRESS_RESPONSE = {
	code: 'oembed_invalid_url',
	message: 'Not Found',
	data: {
		status: 404,
	},
	html: false,
};

const MOCK_RESPONSES = [
	{
		match: createEmbeddingMatcher( 'https://wordpress.org/gutenberg/handbook/' ),
		onRequestMatch: createJSONResponse( MOCK_BAD_WORDPRESS_RESPONSE ),
	},
	{
		match: createEmbeddingMatcher( 'https://wordpress.org/gutenberg/handbook/block-api/attributes/' ),
		onRequestMatch: createJSONResponse( MOCK_EMBED_WORDPRESS_SUCCESS_RESPONSE ),
	},
	{
		match: createEmbeddingMatcher( 'https://www.reddit.com/r/stevenuniverse/comments/8x2lsy/after_a_few_months_of_work_i_finally_finished/' ),
		onRequestMatch: createJSONResponse( MOCK_EMBED_REDDIT_SUCCESS_RESPONSE ),
	},
	{
		match: createEmbeddingMatcher( 'https://www.youtube.com/watch?v=lXMskKTw3Bc' ),
		onRequestMatch: createJSONResponse( MOCK_EMBED_VIDEO_SUCCESS_RESPONSE ),
	},
	{
		match: createEmbeddingMatcher( 'https://cloudup.com/cQFlxqtY4ob' ),
		onRequestMatch: createJSONResponse( MOCK_EMBED_RICH_SUCCESS_RESPONSE ),
	},
	{
		match: createEmbeddingMatcher( 'https://twitter.com/notnownikki' ),
		onRequestMatch: createJSONResponse( MOCK_EMBED_RICH_SUCCESS_RESPONSE ),
	},
	{
		match: createEmbeddingMatcher( 'https://twitter.com/thatbunty' ),
		onRequestMatch: createJSONResponse( MOCK_BAD_EMBED_PROVIDER_RESPONSE ),
	},
	{
		match: createEmbeddingMatcher( 'https://twitter.com/wooyaygutenberg123454312' ),
		onRequestMatch: createJSONResponse( MOCK_CANT_EMBED_RESPONSE ),
	},
];

const addAllEmbeds = async () => {
	// Valid embed.
	await clickBlockAppender();
	await page.keyboard.type( '/embed' );
	await page.keyboard.press( 'Enter' );
	await page.keyboard.type( 'https://twitter.com/notnownikki' );
	await page.keyboard.press( 'Enter' );

	// Valid provider; invalid content.
	await clickBlockAppender();
	await page.keyboard.type( '/embed' );
	await page.keyboard.press( 'Enter' );
	await page.keyboard.type( 'https://twitter.com/wooyaygutenberg123454312' );
	await page.keyboard.press( 'Enter' );

	// WordPress invalid content.
	await clickBlockAppender();
	await page.keyboard.type( '/embed' );
	await page.keyboard.press( 'Enter' );
	await page.keyboard.type( 'https://wordpress.org/gutenberg/handbook/' );
	await page.keyboard.press( 'Enter' );

	// Provider whose oembed API has gone wrong.
	await clickBlockAppender();
	await page.keyboard.type( '/embed' );
	await page.keyboard.press( 'Enter' );
	await page.keyboard.type( 'https://twitter.com/thatbunty' );
	await page.keyboard.press( 'Enter' );

	// WordPress content that can be embedded.
	await clickBlockAppender();
	await page.keyboard.type( '/embed' );
	await page.keyboard.press( 'Enter' );
	await page.keyboard.type( 'https://wordpress.org/gutenberg/handbook/block-api/attributes/' );
	await page.keyboard.press( 'Enter' );

	// Video content.
	await clickBlockAppender();
	await page.keyboard.type( '/embed' );
	await page.keyboard.press( 'Enter' );
	await page.keyboard.type( 'https://www.youtube.com/watch?v=lXMskKTw3Bc' );
	await page.keyboard.press( 'Enter' );

	// Photo content.
	await clickBlockAppender();
	await page.keyboard.type( '/embed' );
	await page.keyboard.press( 'Enter' );
	await page.keyboard.type( 'https://cloudup.com/cQFlxqtY4ob' );
	await page.keyboard.press( 'Enter' );
};

describe( 'Embedding content', () => {
	beforeAll( async () => await setUpResponseMocking( MOCK_RESPONSES ) );
	beforeEach( createNewPost );

	it( 'should render embeds in the correct state', async () => {
		await addAllEmbeds();
		// The successful embeds should be in a correctly classed figure element.
		// This tests that they have switched to the correct block.
		await page.waitForSelector( 'figure.wp-block-embed-twitter' );
		await page.waitForSelector( 'figure.wp-block-embed-cloudup' );
		await page.waitForSelector( 'figure.wp-block-embed-wordpress' );
		// Video embed should also have the aspect ratio class.
		await page.waitForSelector( 'figure.wp-block-embed-youtube.wp-embed-aspect-16-9' );

		// Each failed embed should be in the edit state.
		await page.waitForSelector( 'input[value="https://twitter.com/wooyaygutenberg123454312"]' );
		await page.waitForSelector( 'input[value="https://twitter.com/thatbunty"]' );
		await page.waitForSelector( 'input[value="https://wordpress.org/gutenberg/handbook/"]' );
	} );

	it( 'should allow the user to convert unembeddable URLs to a paragraph with a link in it', async () => {
		// URL that can't be embedded.
		await clickBlockAppender();
		await page.keyboard.type( '/embed' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'https://twitter.com/wooyaygutenberg123454312' );
		await page.keyboard.press( 'Enter' );

		await clickButton( 'Convert to link' );
		expect( await getEditedPostContent() ).toMatchSnapshot();
	} );

	it( 'should allow the user to try embedding a failed URL again', async () => {
		// URL that can't be embedded.
		await clickBlockAppender();
		await page.keyboard.type( '/embed' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'https://twitter.com/wooyaygutenberg123454312' );
		await page.keyboard.press( 'Enter' );
		// Set up a different mock to make sure that try again actually does make the request again.
		await setUpResponseMocking(
			[
				{
					match: createEmbeddingMatcher( 'https://twitter.com/wooyaygutenberg123454312' ),
					onRequestMatch: createJSONResponse( MOCK_EMBED_RICH_SUCCESS_RESPONSE ),
				},
			]
		);
		await clickButton( 'Try again' );
		await page.waitForSelector( 'figure.wp-block-embed-twitter' );
	} );
} );

describe( 'Extending embed blocks', () => {
	beforeAll( async () => {
		// Plugin that overrides the preview and save of the Reddit block.
		// Allows us to enter any content to be saved instead of the URL,
		// so we can check the save code is used when publishing the post.
		await activatePlugin( 'gutenberg-test-extend-embeds' );
		await setUpResponseMocking( MOCK_RESPONSES );
	} );
	afterAll( async () => {
		await deactivatePlugin( 'gutenberg-test-extend-embeds' );
	} );
	beforeEach( createNewPost );

	it( 'can use a custom preview, inspector controls, and save in an extended block', async () => {
		await clickBlockAppender();
		await page.keyboard.type( '/reddit' );
		await page.keyboard.press( 'Enter' );
		await page.keyboard.type( 'https://www.reddit.com/r/stevenuniverse/comments/8x2lsy/after_a_few_months_of_work_i_finally_finished/' );
		await page.keyboard.press( 'Enter' );
		// Check that the response from the custom preview endpoint is rendered.
		await page.waitForFunction(
			"null !== document.querySelector('.components-sandbox') && null !== document.querySelector('.components-sandbox').contentDocument.querySelector('p') && document.querySelector('.components-sandbox').contentDocument.querySelector('p').innerText === 'This is a preview from a custom endpoint.'"
		);

		// Use the custom control to set the save content.
		await page.click( '.edit-post-sidebar__panel-tab[data-label="Block"]' );
		const labels = await page.$x( "//label[contains(text(), 'The content to save')]" );
		await labels[ 0 ].click();
		await page.keyboard.type( 'Save override' );
		await publishPost();

		// View the post.
		const viewPostLinks = await page.$x( "//a[contains(text(), 'View Post')]" );
		await viewPostLinks[ 0 ].click();
		await page.waitForNavigation();

		// Check the custom save was used for the published post.
		const content = await page.$eval( '.entry-content p', ( element ) => element.innerText.trim() );
		expect( content ).toEqual( 'Save override' );
	} );
} );
