insert into users (id, email, display_name, role, xp, rank, total_completions) values
('11111111-1111-4111-8111-111111111111', 'admin@tourchain.test', 'TourChain Admin', 'admin', 0, 'admin', 0),
('22222222-2222-4222-8222-222222222221', 'ram@tourchain.test', 'Ram Gurung', 'guide', 420, 'expert', 27),
('22222222-2222-4222-8222-222222222222', 'pasang@tourchain.test', 'Pasang Sherpa', 'guide', 510, 'master', 42),
('22222222-2222-4222-8222-222222222223', 'maya@tourchain.test', 'Maya Tamang', 'guide', 360, 'advanced', 19),
('33333333-3333-4333-8333-333333333331', 'alex@tourchain.test', 'Alex Walker', 'tourist', 140, 'trailblazer', 3),
('33333333-3333-4333-8333-333333333332', 'nina@tourchain.test', 'Nina Park', 'tourist', 90, 'explorer', 1)
on conflict (id) do nothing;

insert into guides (id, user_id, license_number, bio, languages, specialties, years_experience, is_verified, verified_at, verified_by, reputation_pda, on_chain_score, on_chain_reviews) values
('44444444-4444-4444-8444-444444444441', '22222222-2222-4222-8222-222222222221', 'NTA-GL-1021', 'Annapurna specialist with first-aid training and deep local trail knowledge.', '{"English","Nepali","Hindi"}', '{"Trekking","Cultural Trails"}', 9, true, now(), '11111111-1111-4111-8111-111111111111', 'GuidePdaRam1111111111111111111111111111111', 4.82, 51),
('44444444-4444-4444-8444-444444444442', '22222222-2222-4222-8222-222222222222', 'NTA-GL-2044', 'High-altitude guide focused on safety-first Everest and Khumbu expeditions.', '{"English","Nepali","Sherpa"}', '{"High Altitude","Expedition"}', 13, true, now(), '11111111-1111-4111-8111-111111111111', 'GuidePdaPasang111111111111111111111111111', 4.91, 74),
('44444444-4444-4444-8444-444444444443', '22222222-2222-4222-8222-222222222223', 'NTA-GL-3099', 'Community trek leader for Langtang and village-based cultural routes.', '{"English","Nepali","Tamang"}', '{"Community Trek","Women-led Groups"}', 7, true, now(), '11111111-1111-4111-8111-111111111111', 'GuidePdaMaya11111111111111111111111111111', 4.76, 39)
on conflict (id) do nothing;

insert into routes (id, name, description, difficulty, duration_days, distance_km, max_altitude_meters, region, is_active, created_by) values
('55555555-5555-4555-8555-555555555551', 'Everest Base Camp', 'Classic Khumbu trek to EBC via Namche and Gorakshep.', 'challenging', 14, 130.0, 5364, 'Khumbu', true, '11111111-1111-4111-8111-111111111111'),
('55555555-5555-4555-8555-555555555552', 'Annapurna Circuit', 'Iconic loop around the Annapurna massif crossing Thorong La.', 'challenging', 15, 160.0, 5416, 'Annapurna', true, '11111111-1111-4111-8111-111111111111'),
('55555555-5555-4555-8555-555555555553', 'Langtang Valley', 'Accessible alpine valley trek with glacier and monastery viewpoints.', 'moderate', 8, 77.0, 4984, 'Langtang', true, '11111111-1111-4111-8111-111111111111'),
('55555555-5555-4555-8555-555555555554', 'Manaslu Circuit', 'Remote anti-clockwise circuit with high pass and Tibetan culture.', 'extreme', 16, 177.0, 5106, 'Gorkha', true, '11111111-1111-4111-8111-111111111111'),
('55555555-5555-4555-8555-555555555555', 'Poon Hill Sunrise Trek', 'Short scenic trek for sunrise panoramas and Gurung villages.', 'easy', 4, 32.0, 3210, 'Annapurna', true, '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;

insert into places (id, name, description, category, latitude, longitude, altitude_meters, region, is_active, created_by) values
('66666666-6666-4666-8666-666666666661', 'Lukla', 'Gateway airstrip to the Everest region.', 'trailhead', 27.6881000, 86.7314000, 2860, 'Khumbu', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-666666666662', 'Namche Bazaar', 'Sherpa market town and acclimatization center.', 'village', 27.8057000, 86.7142000, 3440, 'Khumbu', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-666666666663', 'Everest Base Camp', 'Base camp at the foot of Khumbu Icefall.', 'checkpoint', 28.0043000, 86.8571000, 5364, 'Khumbu', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-666666666664', 'Besisahar', 'Annapurna Circuit starting hub.', 'trailhead', 28.2343000, 84.3770000, 760, 'Annapurna', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-666666666665', 'Dharapani', 'Stone village connecting Marsyangdi and Manang trails.', 'village', 28.5500000, 84.3833000, 1960, 'Annapurna', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-666666666666', 'Thorong La Pass', 'High pass crossing on Annapurna Circuit.', 'summit', 28.7979000, 83.9432000, 5416, 'Annapurna', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-666666666667', 'Syabrubesi', 'Entry village for Langtang Valley trek.', 'trailhead', 28.1457000, 85.3418000, 1460, 'Langtang', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-666666666668', 'Lama Hotel', 'Forest rest stop in lower Langtang.', 'teahouse', 28.2199000, 85.4626000, 2470, 'Langtang', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-666666666669', 'Kyanjin Gompa', 'Monastery settlement with glacier viewpoints.', 'temple', 28.2139000, 85.5597000, 3870, 'Langtang', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-66666666666a', 'Soti Khola', 'Starting point for Manaslu trek route.', 'trailhead', 28.3550000, 84.7210000, 730, 'Gorkha', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-66666666666b', 'Samagaun', 'Acclimatization village near Manaslu Base Camp.', 'village', 28.5511000, 84.6472000, 3520, 'Gorkha', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-66666666666c', 'Larkya La Pass', 'High alpine pass on Manaslu Circuit.', 'summit', 28.5498000, 84.6402000, 5106, 'Gorkha', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-66666666666d', 'Nayapul', 'Classic start for Ghorepani-Poon Hill route.', 'trailhead', 28.3323000, 83.8107000, 1070, 'Annapurna', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-66666666666e', 'Ghorepani', 'Village stop before sunrise summit push.', 'village', 28.4000000, 83.7000000, 2874, 'Annapurna', true, '11111111-1111-4111-8111-111111111111'),
('66666666-6666-4666-8666-66666666666f', 'Poon Hill', 'Sunrise viewpoint over Annapurna and Dhaulagiri.', 'viewpoint', 28.4008000, 83.6847000, 3210, 'Annapurna', true, '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;

insert into quests (id, route_id, place_id, title, description, story_text, quest_type, xp_reward, difficulty, is_active, created_by) values
('77777777-7777-4777-8777-777777777771', '55555555-5555-4555-8555-555555555551', '66666666-6666-4666-8666-666666666661', 'Khumbu Kickoff', 'Begin your Everest trail journey from Lukla.', 'Mark the first chapter of your high-altitude story.', 'visit', 20, 'easy', true, '11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-777777777772', '55555555-5555-4555-8555-555555555551', '66666666-6666-4666-8666-666666666662', 'Sherpa Stories', 'Learn one local history fact in Namche Bazaar.', 'Collect oral history from a local tea house host.', 'learn', 30, 'moderate', true, '11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-777777777773', '55555555-5555-4555-8555-555555555552', '66666666-6666-4666-8666-666666666664', 'Annapurna Entry Stamp', 'Check in at Besisahar trailhead.', 'Your circuit badge journey starts here.', 'visit', 15, 'easy', true, '11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-777777777774', '55555555-5555-4555-8555-555555555552', '66666666-6666-4666-8666-666666666665', 'Prayer Wheel Echo', 'Find and document a prayer wheel in Dharapani.', 'Spin the wheel and unlock the mountain clue.', 'photo', 25, 'moderate', true, '11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-777777777775', '55555555-5555-4555-8555-555555555553', '66666666-6666-4666-8666-666666666667', 'Langtang Gate', 'Start your Langtang valley passage at Syabrubesi.', 'Record your first foothold in the valley route.', 'visit', 15, 'easy', true, '11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-777777777776', '55555555-5555-4555-8555-555555555553', '66666666-6666-4666-8666-666666666669', 'Gompa Reflection', 'Offer a respectful visit to Kyanjin Gompa.', 'The story rewards patience and reverence.', 'interact', 35, 'moderate', true, '11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-777777777777', '55555555-5555-4555-8555-555555555554', '66666666-6666-4666-8666-66666666666a', 'Manaslu Threshold', 'Enter the remote corridor at Soti Khola.', 'Cross into the wild chapter of the circuit.', 'visit', 20, 'moderate', true, '11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-777777777778', '55555555-5555-4555-8555-555555555554', '66666666-6666-4666-8666-66666666666c', 'Pass of Resolve', 'Reach and verify Larkya La Pass.', 'The wind itself signs your chapter complete.', 'collect', 50, 'challenging', true, '11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-777777777779', '55555555-5555-4555-8555-555555555555', '66666666-6666-4666-8666-66666666666f', 'Sunrise Witness', 'Capture sunrise from Poon Hill viewpoint.', 'Mountains glow and your proof trail advances.', 'photo', 20, 'easy', true, '11111111-1111-4111-8111-111111111111'),
('77777777-7777-4777-8777-77777777777a', '55555555-5555-4555-8555-555555555552', '66666666-6666-4666-8666-666666666666', 'Laughing Island', 'Find the hidden endpoint quest after crossing Thorong La.', 'A One Piece easter egg quest that reveals the final lore clue.', 'collect', 75, 'challenging', true, '11111111-1111-4111-8111-111111111111')
on conflict (id) do nothing;

insert into services (id, guide_id, route_id, title, description, price_usd, max_group_size, includes, is_active) values
('88888888-8888-4888-8888-888888888881', '44444444-4444-4444-8444-444444444441', '55555555-5555-4555-8555-555555555552', 'Annapurna Circuit Guided Trek', 'Full-service Annapurna circuit with acclimatization support.', 1200, 8, '{"guide","permits","briefing"}', true),
('88888888-8888-4888-8888-888888888882', '44444444-4444-4444-8444-444444444442', '55555555-5555-4555-8555-555555555551', 'Everest Base Camp Expedition', 'High-altitude guided itinerary with safety-focused pacing.', 1800, 6, '{"guide","logistics","acclimatization"}', true),
('88888888-8888-4888-8888-888888888883', '44444444-4444-4444-8444-444444444443', '55555555-5555-4555-8555-555555555553', 'Langtang Community Trek', 'Cultural and scenic valley route with community stays.', 850, 10, '{"guide","community-stay","orientation"}', true)
on conflict (id) do nothing;
