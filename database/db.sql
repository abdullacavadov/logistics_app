-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Ноя 01 2026 г., 10:55
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `logistics`
--

-- --------------------------------------------------------

--
-- Структура таблицы `applications`
--

CREATE TABLE `applications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `load_id` bigint(20) UNSIGNED NOT NULL,
  `vehicle_offer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `carrier_id` bigint(20) UNSIGNED NOT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `currency` char(3) DEFAULT NULL,
  `message` varchar(1000) DEFAULT NULL,
  `status` enum('pending','accepted','rejected','withdrawn','cancelled','completed') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `actor_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(60) NOT NULL,
  `entity` varchar(40) DEFAULT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `actor_id`, `action`, `entity`, `entity_id`, `reason`, `old_values`, `new_values`, `ip`, `created_at`) VALUES
(1, 2, 'load.create', 'load', 1, NULL, NULL, '{\"title\":\"Baki-Tbilisi 10 ton\",\"from_country_id\":1,\"to_country_id\":3,\"pickup_from\":\"2026-11-20\",\"weight_kg\":10000,\"price\":1500,\"currency\":\"EUR\",\"status\":\"published\"}', '::1', '2026-10-30 04:43:19'),
(2, 2, 'load.archived', 'load', 1, NULL, '{\"status\":\"published\"}', '{\"status\":\"archived\"}', '127.0.0.1', '2026-11-01 05:53:26');

-- --------------------------------------------------------

--
-- Структура таблицы `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-356a192b7913b04c54574d18c28d46e6395428ab', 'i:6;', 1793523586),
('laravel-cache-356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1793523586;', 1793523586),
('laravel-cache-424f74a6a7ed4d4ed4761507ebcd209a6ef0937b', 'i:2;', 1793349832),
('laravel-cache-424f74a6a7ed4d4ed4761507ebcd209a6ef0937b:timer', 'i:1793349832;', 1793349832),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:2;', 1793524762),
('laravel-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1793524762;', 1793524762),
('laravel-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0', 'i:3;', 1793526906),
('laravel-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0:timer', 'i:1793526906;', 1793526906);

-- --------------------------------------------------------

--
-- Структура таблицы `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `cargo_types`
--

CREATE TABLE `cargo_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `cargo_types`
--

INSERT INTO `cargo_types` (`id`, `name`, `is_active`) VALUES
(1, 'Ümumi yük', 1),
(2, 'Ərzaq', 1),
(3, 'Tikinti materialları', 1),
(4, 'Avadanlıq', 1),
(5, 'Konteyner', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `companies`
--

CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `legal_name` varchar(200) NOT NULL,
  `country_id` bigint(20) UNSIGNED NOT NULL,
  `tax_id` varchar(40) DEFAULT NULL,
  `contact_person` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `countries`
--

CREATE TABLE `countries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `iso2` char(2) NOT NULL,
  `name` varchar(100) NOT NULL,
  `default_currency` char(3) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `countries`
--

INSERT INTO `countries` (`id`, `iso2`, `name`, `default_currency`, `is_active`) VALUES
(1, 'AZ', 'Azərbaycan', 'AZN', 1),
(2, 'TR', 'Türkiyə', 'TRY', 1),
(3, 'GE', 'Gürcüstan', 'GEL', 1),
(4, 'RU', 'Rusiya', 'RUB', 1),
(5, 'KZ', 'Qazaxıstan', 'KZT', 1),
(6, 'DE', 'Almaniya', 'EUR', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `loads`
--

CREATE TABLE `loads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `cargo_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `from_country_id` bigint(20) UNSIGNED NOT NULL,
  `from_location_id` bigint(20) UNSIGNED DEFAULT NULL,
  `from_address` varchar(255) DEFAULT NULL,
  `from_lat` decimal(9,6) DEFAULT NULL,
  `from_lng` decimal(9,6) DEFAULT NULL,
  `to_country_id` bigint(20) UNSIGNED NOT NULL,
  `to_location_id` bigint(20) UNSIGNED DEFAULT NULL,
  `to_address` varchar(255) DEFAULT NULL,
  `to_lat` decimal(9,6) DEFAULT NULL,
  `to_lng` decimal(9,6) DEFAULT NULL,
  `pickup_from` date NOT NULL,
  `pickup_to` date DEFAULT NULL,
  `delivery_by` date DEFAULT NULL,
  `weight_kg` decimal(10,2) NOT NULL,
  `volume_m3` decimal(8,2) DEFAULT NULL,
  `pallets` int(10) UNSIGNED DEFAULT NULL,
  `quantity` int(10) UNSIGNED DEFAULT NULL,
  `required_vehicle_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `load_vehicle_type_id` bigint(20) UNSIGNED DEFAULT NULL,
  `needs_refrigeration` tinyint(1) NOT NULL DEFAULT 0,
  `temp_min` decimal(5,1) DEFAULT NULL,
  `temp_max` decimal(5,1) DEFAULT NULL,
  `is_hazardous` tinyint(1) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `currency` char(3) DEFAULT NULL,
  `applications` enum('web','whatsapp') NOT NULL,
  `price_negotiable` tinyint(1) NOT NULL DEFAULT 1,
  `status` enum('draft','pending_moderation','rejected','published','has_applications','agreed','in_transit','completed','cancelled','archived') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `loads`
--

INSERT INTO `loads` (`id`, `user_id`, `title`, `description`, `cargo_type_id`, `from_country_id`, `from_location_id`, `from_address`, `from_lat`, `from_lng`, `to_country_id`, `to_location_id`, `to_address`, `to_lat`, `to_lng`, `pickup_from`, `pickup_to`, `delivery_by`, `weight_kg`, `volume_m3`, `pallets`, `required_vehicle_type_id`, `needs_refrigeration`, `temp_min`, `temp_max`, `is_hazardous`, `notes`, `price`, `currency`, `applications`, `price_negotiable`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'Baki-Tbilisi 10 ton', NULL, NULL, 1, NULL, NULL, NULL, NULL, 3, NULL, NULL, NULL, NULL, '2026-11-20', NULL, NULL, 10000.00, NULL, NULL, NULL, 0, NULL, NULL, 0, NULL, 1500.00, 'EUR', 'web', 1, 'published', '2026-10-30 04:43:19', '2026-11-01 05:53:26');

-- --------------------------------------------------------

--
-- Структура таблицы `locations`
--

CREATE TABLE `locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `geoname_id` bigint(20) UNSIGNED DEFAULT NULL,
  `country_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `lat` decimal(9,6) DEFAULT NULL,
  `lng` decimal(9,6) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `matches`
--

CREATE TABLE `matches` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `load_id` bigint(20) UNSIGNED NOT NULL,
  `vehicle_offer_id` bigint(20) UNSIGNED NOT NULL,
  `score` tinyint(3) UNSIGNED NOT NULL,
  `reasons` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`reasons`)),
  `algorithm_version` varchar(20) NOT NULL,
  `calculated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `matching_settings`
--

CREATE TABLE `matching_settings` (
  `k` varchar(40) NOT NULL,
  `v` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `matching_settings`
--

INSERT INTO `matching_settings` (`k`, `v`) VALUES
('min_score', '30'),
('version', '1.0'),
('w_capacity', '15'),
('w_date', '25'),
('w_price', '20'),
('w_route', '40');

-- --------------------------------------------------------

--
-- Структура таблицы `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_10_30_080626_create_personal_access_tokens_table', 1),
(5, '2026_11_01_000001_create_core_tables', 1),
(6, '2026_11_01_000002_create_cargo_tables', 1),
(7, '2026_11_01_000003_create_subscription_tables', 1),
(8, '2026_11_01_000004_create_matching_settings', 2),
(9, '2026_11_06_000001_add_load_ad_catalogs', 3),
(10, '2026_11_06_000002_add_multilingual_location_catalogs', 4);

-- --------------------------------------------------------

--
-- Структура таблицы `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `subscription_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `order_id` varchar(64) NOT NULL,
  `provider_txn_id` varchar(100) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` char(3) NOT NULL,
  `status` enum('initiated','processing','success','failed','cancelled','refunded') NOT NULL DEFAULT 'initiated',
  `period_applied` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `payment_events`
--

CREATE TABLE `payment_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `event_key` varchar(120) NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`payload`)),
  `signature_valid` tinyint(1) DEFAULT NULL,
  `received_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'api', '1b18297187bf44c97e975e4faa362491b2f9cf4be0ebb3021f6d999cf67205ef', '[\"*\"]', NULL, NULL, '2026-10-30 04:35:20', '2026-10-30 04:35:20'),
(2, 'App\\Models\\User', 1, 'api', '4806505d7048073d79d045744d7b0c388f5cb1e5116504a2541a4207f0d3b734', '[\"*\"]', '2026-10-30 04:54:54', NULL, '2026-10-30 04:36:15', '2026-10-30 04:54:54'),
(3, 'App\\Models\\User', 2, 'api', 'fa6ae78a561891f2932b3f7a033e70ce8cebd547610ba52c1002ed02c7c33f25', '[\"*\"]', '2026-10-30 04:46:18', NULL, '2026-10-30 04:42:53', '2026-10-30 04:46:18');

-- --------------------------------------------------------

--
-- Структура таблицы `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('6vNV4ZVztgyUH7rYSS7yuynEPZzIk1DGGxT2wxk5', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN1JjWjNhcGNGa0kwM213NGNld3BFRnB3T0RxYndvc3JKRnQ1a0NkdSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdjEvbG9hZHM/cGVyX3BhZ2U9NTAiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1793521884),
('FpmeR4AQlBRTVthn5wTo0ltW68AzVNCFKNNIIRXh', 2, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', 'YTo1OntzOjY6Il90b2tlbiI7czo0MDoiYnhxWndxSVUxRkhKUlRFTzNkamZWS29qYWYzQlhxMDJUNGpWSWpkciI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdjEvbG9hZHM/cGVyX3BhZ2U9NTAiO3M6NToicm91dGUiO047fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtpOjI7czoxNzoicGFzc3dvcmRfaGFzaF93ZWIiO3M6NjQ6IjBiMTE3MWI3ZWU3MzMyNWFmNzdkMzE3ODQ3ZGU2Mzc0NGIyYjZiM2Q5MGViM2U0OWViMDg4NzYwZDgzMmY2NzkiO30=', 1793526851),
('JzqvkK3pgsxuN8gOpTDfeBkoWyXht3etaHHREIfv', NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoidXRKb3JUUVk3VVdkU2JXZ244VEdFT2l3bVVYMnpIV21hWHRmTXQyZyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdjEvbG9hZHM/cGVyX3BhZ2U9NTAiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1793521884),
('oEHQW27pMtA4fPEqzV6YaMIH1qTpfu1GnSmHjMlj', NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ1MxUkhiNjBZbkk5NHhGR0dZYzhMbEM2cFBFcUdTQVBhTHpvdVF4biI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdjEvYXV0aC9tZSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1793521884),
('oxnwmE3a6POr33HRHdoGbOj8bMU2nDxQDKFoB7oR', NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaEY0ZkxVdmZTbTJSc0Q5VW44S1ZLbVcxYlJ5RUJ0OXJ3Tkx3aU1CbyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdjEvbG9hZHM/cGVyX3BhZ2U9NTAiO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1793521883),
('sGPBnMIkRM7LHjrwQ1rlSnhe0M5gI5CXgJnPodcJ', NULL, '127.0.0.1', 'Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYjFNazlERTF6cU1mZDFDb3lDODJpWUFLWmZmbWVZN3JPelVGN1dtRSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MzY6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMC9hcGkvdjEvYXV0aC9tZSI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1793521883);

-- --------------------------------------------------------

--
-- Структура таблицы `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `kind` enum('carrier','business_place') NOT NULL,
  `place_id` bigint(20) UNSIGNED DEFAULT NULL,
  `country_id` bigint(20) UNSIGNED NOT NULL,
  `plan_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('active','expired','cancelled','payment_pending','payment_failed','grace') NOT NULL DEFAULT 'payment_pending',
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `next_payment_at` timestamp NULL DEFAULT NULL,
  `auto_renew` tinyint(1) NOT NULL DEFAULT 0,
  `last_payment_status` varchar(20) DEFAULT NULL,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancel_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `kind` enum('carrier','business_place') NOT NULL,
  `country_id` bigint(20) UNSIGNED NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `currency` char(3) NOT NULL,
  `duration_months` tinyint(3) UNSIGNED NOT NULL DEFAULT 1,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `effective_from` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(190) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `google_id` varchar(64) DEFAULT NULL,
  `country_id` bigint(20) UNSIGNED DEFAULT NULL,
  `phone_verified_at` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `is_blocked` tinyint(1) NOT NULL DEFAULT 0,
  `terms_accepted_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`id`, `name`, `phone`, `email`, `password`, `google_id`, `country_id`, `phone_verified_at`, `email_verified_at`, `is_blocked`, `terms_accepted_at`, `remember_token`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Test Surucu', '+994501234567', NULL, '$2y$12$n9hV4zypqCGOBN2X5Z70Xu351QGxHpjT20hUqZWFbs4PQMrkci/fi', NULL, 1, NULL, NULL, 0, '2026-10-30 04:35:19', NULL, '2026-10-30 04:35:20', '2026-10-30 04:35:20', NULL),
(2, 'Yuk Sahibi', '+994507654321', NULL, '$2y$12$lRxlBvT6mswTmCc4V8BFTuqxEvidmbmKRfBPYxfgicQ42XIwpL6Je', NULL, 1, NULL, NULL, 0, '2026-10-30 04:42:52', NULL, '2026-10-30 04:42:53', '2026-10-30 04:42:53', NULL);

-- --------------------------------------------------------

--
-- Структура таблицы `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('shipper','carrier','business_owner','admin') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role`) VALUES
(1, 'carrier'),
(2, 'shipper');

-- --------------------------------------------------------

--
-- Структура таблицы `vehicles`
--

CREATE TABLE `vehicles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `company_id` bigint(20) UNSIGNED DEFAULT NULL,
  `vehicle_type_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `brand` varchar(60) DEFAULT NULL,
  `model` varchar(60) DEFAULT NULL,
  `capacity_kg` int(10) UNSIGNED NOT NULL,
  `capacity_m3` decimal(8,2) DEFAULT NULL,
  `body_type` varchar(60) DEFAULT NULL,
  `is_refrigerated` tinyint(1) NOT NULL DEFAULT 0,
  `reg_country_id` bigint(20) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `vehicles`
--

INSERT INTO `vehicles` (`id`, `user_id`, `company_id`, `vehicle_type_id`, `name`, `brand`, `model`, `capacity_kg`, `capacity_m3`, `body_type`, `is_refrigerated`, `reg_country_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 1, 'Volvo FH', NULL, NULL, 20000, 82.00, NULL, 0, NULL, 1, '2026-10-30 04:45:47', '2026-10-30 04:45:47');

-- --------------------------------------------------------

--
-- Структура таблицы `vehicle_offers`
--

CREATE TABLE `vehicle_offers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `vehicle_id` bigint(20) UNSIGNED NOT NULL,
  `from_country_id` bigint(20) UNSIGNED NOT NULL,
  `from_location_id` bigint(20) UNSIGNED DEFAULT NULL,
  `to_country_id` bigint(20) UNSIGNED NOT NULL,
  `to_location_id` bigint(20) UNSIGNED DEFAULT NULL,
  `available_from` date NOT NULL,
  `available_to` date NOT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `currency` char(3) DEFAULT NULL,
  `terms` text DEFAULT NULL,
  `status` enum('draft','active','applied','agreed','busy','completed','cancelled','expired') NOT NULL DEFAULT 'draft',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `vehicle_offers`
--

INSERT INTO `vehicle_offers` (`id`, `user_id`, `vehicle_id`, `from_country_id`, `from_location_id`, `to_country_id`, `to_location_id`, `available_from`, `available_to`, `price`, `currency`, `terms`, `status`, `created_at`, `updated_at`) VALUES
(2, 1, 1, 1, NULL, 3, NULL, '2026-11-18', '2026-11-25', 1400.00, 'EUR', NULL, 'active', '2026-10-30 04:54:54', '2026-10-30 04:54:54');

-- --------------------------------------------------------

--
-- Структура таблицы `vehicle_types`
--

CREATE TABLE `vehicle_types` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_refrigerated` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Дамп данных таблицы `vehicle_types`
--

INSERT INTO `vehicle_types` (`id`, `name`, `is_refrigerated`, `is_active`) VALUES
(1, 'Tent (parusnik)', 0, 1),
(2, 'Refrijerator', 1, 1),
(3, 'Konteyner daşıyan', 0, 1),
(4, 'Furqon', 0, 1),
(5, 'Platforma', 0, 1),
(6, 'Sisternli', 0, 1);


-- Load body types shown in the new load-ad form
CREATE TABLE `load_vehicle_types` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `category` varchar(40) NOT NULL,
  `capacity_m3` smallint(5) UNSIGNED DEFAULT NULL,
  `image_path` varchar(255) NOT NULL,
  `sort_order` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `load_vehicle_type_translations` (
  `load_vehicle_type_id` bigint(20) UNSIGNED NOT NULL,
  `locale` varchar(8) NOT NULL,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`load_vehicle_type_id`, `locale`),
  CONSTRAINT `load_vehicle_type_translations_type_id_foreign` FOREIGN KEY (`load_vehicle_type_id`) REFERENCES `load_vehicle_types` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `country_translations` (
  `country_id` bigint(20) UNSIGNED NOT NULL,
  `locale` varchar(8) NOT NULL,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`country_id`, `locale`),
  CONSTRAINT `country_translations_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `location_translations` (
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `locale` varchar(8) NOT NULL,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`location_id`, `locale`),
  CONSTRAINT `location_translations_location_id_foreign` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `country_translations` (`country_id`, `locale`, `name`) SELECT `id`, 'az', `name` FROM `countries`;
INSERT INTO `country_translations` (`country_id`, `locale`, `name`) SELECT `id`, 'ru', CASE `iso2` WHEN 'AZ' THEN 'Азербайджан' WHEN 'TR' THEN 'Турция' WHEN 'GE' THEN 'Грузия' WHEN 'RU' THEN 'Россия' WHEN 'KZ' THEN 'Казахстан' WHEN 'DE' THEN 'Германия' ELSE `name` END FROM `countries`;
INSERT INTO `country_translations` (`country_id`, `locale`, `name`) SELECT `id`, 'en', CASE `iso2` WHEN 'AZ' THEN 'Azerbaijan' WHEN 'TR' THEN 'Turkey' WHEN 'GE' THEN 'Georgia' WHEN 'RU' THEN 'Russia' WHEN 'KZ' THEN 'Kazakhstan' WHEN 'DE' THEN 'Germany' ELSE `name` END FROM `countries`;
INSERT INTO `country_translations` (`country_id`, `locale`, `name`) SELECT `id`, 'tr', CASE `iso2` WHEN 'AZ' THEN 'Azerbaycan' WHEN 'TR' THEN 'Türkiye' WHEN 'GE' THEN 'Gürcistan' WHEN 'RU' THEN 'Rusya' WHEN 'KZ' THEN 'Kazakistan' WHEN 'DE' THEN 'Almanya' ELSE `name` END FROM `countries`;
INSERT INTO `location_translations` (`location_id`, `locale`, `name`) SELECT `id`, 'az', `name` FROM `locations`;

INSERT INTO `load_vehicle_types` (`name`, `category`, `capacity_m3`, `image_path`, `sort_order`, `is_active`) VALUES
('Tent 86 m³','tent',86,'/images/load-vehicle-types/tent.svg',10,1),
('Tent 90 m³','tent',90,'/images/load-vehicle-types/tent.svg',20,1),
('Tent 92 m³','tent',92,'/images/load-vehicle-types/tent.svg',30,1),
('Tent 96 m³','tent',96,'/images/load-vehicle-types/tent.svg',40,1),
('Tent 100 m³','tent',100,'/images/load-vehicle-types/tent.svg',50,1),
('Tent 105 m³','tent',105,'/images/load-vehicle-types/tent.svg',60,1),
('Tent 110 m³','tent',110,'/images/load-vehicle-types/tent.svg',70,1),
('Mega tent 110 m³','mega_tent',110,'/images/load-vehicle-types/mega-tent.svg',80,1),
('Mega tent 120 m³','mega_tent',120,'/images/load-vehicle-types/mega-tent.svg',90,1),
('Mega tent 130 m³','mega_tent',130,'/images/load-vehicle-types/mega-tent.svg',100,1),
('Mega tent 140 m³','mega_tent',140,'/images/load-vehicle-types/mega-tent.svg',110,1),
('Ref — rejimli','refrigerator',NULL,'/images/load-vehicle-types/ref.svg',120,1),
('Ref — rejimsiz','refrigerator',NULL,'/images/load-vehicle-types/ref.svg',130,1),
('Avtodaşıyan','car_carrier',NULL,'/images/load-vehicle-types/car-carrier.svg',140,1),
('Alçaq platformalı','low_loader',NULL,'/images/load-vehicle-types/low-loader.svg',150,1),
('Konteyner daşıyıcı','container_carrier',NULL,'/images/load-vehicle-types/container-carrier.svg',160,1),
('Digər','other',NULL,'/images/load-vehicle-types/other.svg',170,1);

INSERT INTO `load_vehicle_type_translations` (`load_vehicle_type_id`, `locale`, `name`) SELECT `id`, 'az', `name` FROM `load_vehicle_types`;
INSERT INTO `load_vehicle_type_translations` (`load_vehicle_type_id`, `locale`, `name`) VALUES
(1, 'ru', 'Тент 86 м³'),
(1, 'en', 'Curtainsider 86 m³'),
(1, 'tr', 'Tent 86 m³'),
(2, 'ru', 'Тент 90 м³'),
(2, 'en', 'Curtainsider 90 m³'),
(2, 'tr', 'Tent 90 m³'),
(3, 'ru', 'Тент 92 м³'),
(3, 'en', 'Curtainsider 92 m³'),
(3, 'tr', 'Tent 92 m³'),
(4, 'ru', 'Тент 96 м³'),
(4, 'en', 'Curtainsider 96 m³'),
(4, 'tr', 'Tent 96 m³'),
(5, 'ru', 'Тент 100 м³'),
(5, 'en', 'Curtainsider 100 m³'),
(5, 'tr', 'Tent 100 m³'),
(6, 'ru', 'Тент 105 м³'),
(6, 'en', 'Curtainsider 105 m³'),
(6, 'tr', 'Tent 105 m³'),
(7, 'ru', 'Тент 110 м³'),
(7, 'en', 'Curtainsider 110 m³'),
(7, 'tr', 'Tent 110 m³'),
(8, 'ru', 'Мега-тент 110 м³'),
(8, 'en', 'Mega curtainsider 110 m³'),
(8, 'tr', 'Mega tent 110 m³'),
(9, 'ru', 'Мега-тент 120 м³'),
(9, 'en', 'Mega curtainsider 120 m³'),
(9, 'tr', 'Mega tent 120 m³'),
(10, 'ru', 'Мега-тент 130 м³'),
(10, 'en', 'Mega curtainsider 130 m³'),
(10, 'tr', 'Mega tent 130 m³'),
(11, 'ru', 'Мега-тент 140 м³'),
(11, 'en', 'Mega curtainsider 140 m³'),
(11, 'tr', 'Mega tent 140 m³'),
(12, 'ru', 'Рефрижератор с режимом'),
(12, 'en', 'Refrigerated trailer'),
(12, 'tr', 'Frigorifik (soğutmalı)'),
(13, 'ru', 'Рефрижератор без режима'),
(13, 'en', 'Refrigerated trailer (no temperature setting)'),
(13, 'tr', 'Frigorifik (rejimsiz)'),
(14, 'ru', 'Автовоз'),
(14, 'en', 'Car transporter'),
(14, 'tr', 'Araç taşıyıcı'),
(15, 'ru', 'Низкорамный трал'),
(15, 'en', 'Low loader'),
(15, 'tr', 'Lowbed (alçak yataklı)'),
(16, 'ru', 'Контейнеровоз'),
(16, 'en', 'Container carrier'),
(16, 'tr', 'Konteyner taşıyıcı'),
(17, 'ru', 'Другое'),
(17, 'en', 'Other'),
(17, 'tr', 'Diğer');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `applications_load_id_carrier_id_unique` (`load_id`,`carrier_id`),
  ADD KEY `applications_vehicle_offer_id_foreign` (`vehicle_offer_id`),
  ADD KEY `applications_carrier_id_foreign` (`carrier_id`);

--
-- Индексы таблицы `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_entity_entity_id_index` (`entity`,`entity_id`);

--
-- Индексы таблицы `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Индексы таблицы `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Индексы таблицы `cargo_types`
--
ALTER TABLE `cargo_types`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `companies_user_id_foreign` (`user_id`),
  ADD KEY `companies_country_id_foreign` (`country_id`);

--
-- Индексы таблицы `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `countries_iso2_unique` (`iso2`);

--
-- Индексы таблицы `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Индексы таблицы `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Индексы таблицы `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `loads`
--
ALTER TABLE `loads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `loads_user_id_foreign` (`user_id`),
  ADD KEY `loads_cargo_type_id_foreign` (`cargo_type_id`),
  ADD KEY `loads_from_location_id_foreign` (`from_location_id`),
  ADD KEY `loads_to_country_id_foreign` (`to_country_id`),
  ADD KEY `loads_to_location_id_foreign` (`to_location_id`),
  ADD KEY `loads_required_vehicle_type_id_foreign` (`required_vehicle_type_id`),
  ADD KEY `loads_load_vehicle_type_id_foreign` (`load_vehicle_type_id`),
  ADD KEY `loads_status_pickup_from_index` (`status`,`pickup_from`),
  ADD KEY `loads_from_country_id_to_country_id_index` (`from_country_id`,`to_country_id`);

--
-- Индексы таблицы `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `locations_geoname_id_unique` (`geoname_id`),
  ADD KEY `locations_country_id_name_index` (`country_id`,`name`);

--
-- Индексы таблицы `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `matches_load_id_vehicle_offer_id_unique` (`load_id`,`vehicle_offer_id`),
  ADD KEY `matches_vehicle_offer_id_foreign` (`vehicle_offer_id`),
  ADD KEY `matches_score_index` (`score`);

--
-- Индексы таблицы `matching_settings`
--
ALTER TABLE `matching_settings`
  ADD PRIMARY KEY (`k`);

--
-- Индексы таблицы `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Индексы таблицы `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_order_id_unique` (`order_id`),
  ADD UNIQUE KEY `payments_provider_txn_id_unique` (`provider_txn_id`),
  ADD KEY `payments_subscription_id_foreign` (`subscription_id`),
  ADD KEY `payments_user_id_foreign` (`user_id`);

--
-- Индексы таблицы `payment_events`
--
ALTER TABLE `payment_events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_events_event_key_unique` (`event_key`);

--
-- Индексы таблицы `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Индексы таблицы `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Индексы таблицы `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriptions_country_id_foreign` (`country_id`),
  ADD KEY `subscriptions_plan_id_foreign` (`plan_id`),
  ADD KEY `subscriptions_user_id_kind_status_index` (`user_id`,`kind`,`status`);

--
-- Индексы таблицы `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscription_plans_country_id_foreign` (`country_id`),
  ADD KEY `subscription_plans_kind_country_id_is_active_index` (`kind`,`country_id`,`is_active`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_phone_unique` (`phone`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_google_id_unique` (`google_id`),
  ADD KEY `users_country_id_foreign` (`country_id`);

--
-- Индексы таблицы `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role`);

--
-- Индексы таблицы `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicles_user_id_foreign` (`user_id`),
  ADD KEY `vehicles_company_id_foreign` (`company_id`),
  ADD KEY `vehicles_vehicle_type_id_foreign` (`vehicle_type_id`),
  ADD KEY `vehicles_reg_country_id_foreign` (`reg_country_id`);

--
-- Индексы таблицы `vehicle_offers`
--
ALTER TABLE `vehicle_offers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_offers_user_id_foreign` (`user_id`),
  ADD KEY `vehicle_offers_vehicle_id_foreign` (`vehicle_id`),
  ADD KEY `vehicle_offers_from_country_id_foreign` (`from_country_id`),
  ADD KEY `vehicle_offers_from_location_id_foreign` (`from_location_id`),
  ADD KEY `vehicle_offers_to_country_id_foreign` (`to_country_id`),
  ADD KEY `vehicle_offers_to_location_id_foreign` (`to_location_id`),
  ADD KEY `vehicle_offers_status_available_to_index` (`status`,`available_to`);

--
-- Индексы таблицы `vehicle_types`
--
ALTER TABLE `vehicle_types`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `applications`
--
ALTER TABLE `applications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `cargo_types`
--
ALTER TABLE `cargo_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT для таблицы `companies`
--
ALTER TABLE `companies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `countries`
--
ALTER TABLE `countries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `loads`
--
ALTER TABLE `loads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `locations`
--
ALTER TABLE `locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `matches`
--
ALTER TABLE `matches`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT для таблицы `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `payment_events`
--
ALTER TABLE `payment_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `vehicle_offers`
--
ALTER TABLE `vehicle_offers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `vehicle_types`
--
ALTER TABLE `vehicle_types`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_carrier_id_foreign` FOREIGN KEY (`carrier_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `applications_load_id_foreign` FOREIGN KEY (`load_id`) REFERENCES `loads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_vehicle_offer_id_foreign` FOREIGN KEY (`vehicle_offer_id`) REFERENCES `vehicle_offers` (`id`);

--
-- Ограничения внешнего ключа таблицы `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`),
  ADD CONSTRAINT `companies_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `loads`
--
ALTER TABLE `loads`
  ADD CONSTRAINT `loads_cargo_type_id_foreign` FOREIGN KEY (`cargo_type_id`) REFERENCES `cargo_types` (`id`),
  ADD CONSTRAINT `loads_from_country_id_foreign` FOREIGN KEY (`from_country_id`) REFERENCES `countries` (`id`),
  ADD CONSTRAINT `loads_from_location_id_foreign` FOREIGN KEY (`from_location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `loads_required_vehicle_type_id_foreign` FOREIGN KEY (`required_vehicle_type_id`) REFERENCES `vehicle_types` (`id`),
  ADD CONSTRAINT `loads_load_vehicle_type_id_foreign` FOREIGN KEY (`load_vehicle_type_id`) REFERENCES `load_vehicle_types` (`id`),
  ADD CONSTRAINT `loads_to_country_id_foreign` FOREIGN KEY (`to_country_id`) REFERENCES `countries` (`id`),
  ADD CONSTRAINT `loads_to_location_id_foreign` FOREIGN KEY (`to_location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `loads_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `locations`
--
ALTER TABLE `locations`
  ADD CONSTRAINT `locations_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`);

--
-- Ограничения внешнего ключа таблицы `matches`
--
ALTER TABLE `matches`
  ADD CONSTRAINT `matches_load_id_foreign` FOREIGN KEY (`load_id`) REFERENCES `loads` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matches_vehicle_offer_id_foreign` FOREIGN KEY (`vehicle_offer_id`) REFERENCES `vehicle_offers` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_subscription_id_foreign` FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions` (`id`),
  ADD CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`),
  ADD CONSTRAINT `subscriptions_plan_id_foreign` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`),
  ADD CONSTRAINT `subscriptions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ограничения внешнего ключа таблицы `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD CONSTRAINT `subscription_plans_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`);

--
-- Ограничения внешнего ключа таблицы `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`);

--
-- Ограничения внешнего ключа таблицы `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `vehicles_reg_country_id_foreign` FOREIGN KEY (`reg_country_id`) REFERENCES `countries` (`id`),
  ADD CONSTRAINT `vehicles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `vehicles_vehicle_type_id_foreign` FOREIGN KEY (`vehicle_type_id`) REFERENCES `vehicle_types` (`id`);

--
-- Ограничения внешнего ключа таблицы `vehicle_offers`
--
ALTER TABLE `vehicle_offers`
  ADD CONSTRAINT `vehicle_offers_from_country_id_foreign` FOREIGN KEY (`from_country_id`) REFERENCES `countries` (`id`),
  ADD CONSTRAINT `vehicle_offers_from_location_id_foreign` FOREIGN KEY (`from_location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `vehicle_offers_to_country_id_foreign` FOREIGN KEY (`to_country_id`) REFERENCES `countries` (`id`),
  ADD CONSTRAINT `vehicle_offers_to_location_id_foreign` FOREIGN KEY (`to_location_id`) REFERENCES `locations` (`id`),
  ADD CONSTRAINT `vehicle_offers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `vehicle_offers_vehicle_id_foreign` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
