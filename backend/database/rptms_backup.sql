-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: rptms
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `application_documents`
--

DROP TABLE IF EXISTS `application_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_documents` (
  `id` char(36) NOT NULL,
  `application_id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `upload_status` varchar(255) NOT NULL DEFAULT 'Pending',
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) unsigned DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `storage_path` varchar(255) DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT NULL,
  `verified_by` char(36) DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_documents_application_id_type_unique` (`application_id`,`type`),
  KEY `application_documents_verified_by_foreign` (`verified_by`),
  CONSTRAINT `application_documents_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `application_documents_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_documents`
--

LOCK TABLES `application_documents` WRITE;
/*!40000 ALTER TABLE `application_documents` DISABLE KEYS */;
INSERT INTO `application_documents` VALUES ('a2e6ccb9-2be8-4529-9e90-d7934c12ab35','a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','Title','Verified','title.pdf',100000,'application/pdf',NULL,'2026-10-09 07:19:46',NULL,NULL,'2026-10-04 13:46:48','2026-10-09 07:19:46'),('a2e6ccb9-2d2e-4d89-b462-f493661baa58','a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','Tax Declaration','Verified','tax_dec.pdf',100000,'application/pdf',NULL,'2026-10-09 07:19:46',NULL,NULL,'2026-10-04 13:46:48','2026-10-09 07:19:46'),('a2e6ccb9-2e38-45a4-8806-a08e6381b476','a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','Survey Plan','Uploaded','survey.pdf',100000,'application/pdf',NULL,'2026-10-09 07:19:46',NULL,NULL,'2026-10-04 13:46:48','2026-10-09 07:19:46'),('a2e6ccb9-2f3e-450c-86c4-ba14004b03ac','a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','Building Permit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-3026-41ef-a1b6-5136365c8a79','a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','Government ID','Verified','id.jpg',100000,'image/jpeg',NULL,'2026-10-09 07:19:46',NULL,NULL,'2026-10-04 13:46:48','2026-10-09 07:19:46'),('a2e6ccb9-3111-4734-923d-0f9f48c0861c','a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','Deed of Sale','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-3214-44b4-9209-957c2bbab13f','a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','Affidavit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-32c6-46de-aef1-325836e73da4','a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','Exemption Document','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-373e-4e65-a3d8-8055c25bbfbc','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Title','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-37f8-400c-a784-ac4c152deb26','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Tax Declaration','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-38ee-4747-b9ed-074683ffb2de','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Survey Plan','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-39b2-4d09-8d24-e8bc5d0f96c8','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Building Permit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-3a70-4b41-bd77-19f021258d79','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Government ID','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-3b76-45a3-b1ec-a121917c3971','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Deed of Sale','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-3c63-46b5-8444-c632835886ba','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Affidavit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-3d2a-4dfa-af40-9e3d08b2a21b','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Exemption Document','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-45e2-4a50-8ad4-1c7435653bd8','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Title','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-46e2-4c2c-9869-4aebe3944bb1','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Tax Declaration','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-47c1-440f-b795-c022bcc3aa9e','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Survey Plan','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-488d-428e-91a7-1f037be6edb2','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Building Permit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-4944-4c8c-ba1b-3fe4c017b085','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Government ID','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-4a19-4e38-9082-c595b75508ad','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Deed of Sale','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-4add-4f72-8543-7bcbc592c54c','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Affidavit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-4bb9-491a-9165-865ca0841b1e','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Exemption Document','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-4d91-4515-8949-c78b2cdc24eb','a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','Title','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-4e9e-42d7-9cac-66850596ad67','a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','Tax Declaration','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-4f66-467a-9075-a4f6d398cc8d','a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','Survey Plan','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5057-4ce4-93f8-b727092a852f','a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','Building Permit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-512d-4846-aaea-58870450970f','a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','Government ID','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5202-42ed-9601-31d09f425227','a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','Deed of Sale','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-530b-4db3-ac1b-fa045c43e02f','a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','Affidavit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-53c9-4ee5-93fc-46c8bd8c6177','a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','Exemption Document','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-558f-484c-818e-7f11d311ee47','a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','Title','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5663-4289-b6c3-d848486e097f','a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','Tax Declaration','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5732-41da-90df-a45ee50bd4f4','a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','Survey Plan','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5827-405d-9f80-c2586076eb47','a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','Building Permit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-58f6-49ca-a89c-9f790fbb9990','a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','Government ID','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-59be-49ff-abf5-47d4f6126148','a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','Deed of Sale','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5a91-4cf2-9f36-4134bb5fbcc8','a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','Affidavit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5b79-40ae-8c08-4d226299a3e9','a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','Exemption Document','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5d47-4eee-99cd-d3b8fa753d62','a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','Title','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5e2c-4326-bf06-da4ed5ea0d11','a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','Tax Declaration','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5f21-421f-9b62-3d7cdd076ca3','a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','Survey Plan','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5fe0-4ee8-af56-02877d7c0e3a','a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','Building Permit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-60c8-4d96-bf39-48f81b0ba033','a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','Government ID','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6198-4d9c-bd62-8add175bf03f','a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','Deed of Sale','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6262-4623-83e5-3360bf817c01','a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','Affidavit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6363-4833-80c0-2a46bc5f573d','a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','Exemption Document','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6582-4b96-a83d-4b12d14c9f57','a2e6ccb9-6471-47e8-9fbd-7276b18264de','Title','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6655-4d6f-83d2-046e9e039b08','a2e6ccb9-6471-47e8-9fbd-7276b18264de','Tax Declaration','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-670d-4695-930e-a101d2515f9e','a2e6ccb9-6471-47e8-9fbd-7276b18264de','Survey Plan','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-67ec-47c2-9a03-4e65c1fb9982','a2e6ccb9-6471-47e8-9fbd-7276b18264de','Building Permit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-68bd-44fc-939a-3619eb82d882','a2e6ccb9-6471-47e8-9fbd-7276b18264de','Government ID','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6992-418a-af8a-eb0c52b0d7a5','a2e6ccb9-6471-47e8-9fbd-7276b18264de','Deed of Sale','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6a74-4f6a-875d-4b6b9d69caf1','a2e6ccb9-6471-47e8-9fbd-7276b18264de','Affidavit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6b57-4e9e-a0f5-db1cac9985ed','a2e6ccb9-6471-47e8-9fbd-7276b18264de','Exemption Document','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6d13-4218-8bd6-5493ce2f2dc5','a2e6ccb9-6c16-449f-83fa-25008a190dc4','Title','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6df3-4e22-a499-6cabd43fa824','a2e6ccb9-6c16-449f-83fa-25008a190dc4','Tax Declaration','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6eec-4e5f-ba17-1fc1f7b6ee29','a2e6ccb9-6c16-449f-83fa-25008a190dc4','Survey Plan','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6fdf-4bb5-9cd2-1d00071cbae0','a2e6ccb9-6c16-449f-83fa-25008a190dc4','Building Permit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-70a1-4584-bfcf-fa7fcd774237','a2e6ccb9-6c16-449f-83fa-25008a190dc4','Government ID','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-7192-42b8-abc2-51aef03598df','a2e6ccb9-6c16-449f-83fa-25008a190dc4','Deed of Sale','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-725e-4888-8d54-611d522ce580','a2e6ccb9-6c16-449f-83fa-25008a190dc4','Affidavit','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-731e-4fc3-abb7-85db0c8e8f2b','a2e6ccb9-6c16-449f-83fa-25008a190dc4','Exemption Document','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48');
/*!40000 ALTER TABLE `application_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_locations`
--

DROP TABLE IF EXISTS `application_locations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_locations` (
  `id` char(36) NOT NULL,
  `application_id` char(36) NOT NULL,
  `street` varchar(255) NOT NULL,
  `barangay` varchar(255) NOT NULL,
  `municipality` varchar(255) NOT NULL,
  `province` varchar(255) NOT NULL,
  `zip` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_locations_application_id_unique` (`application_id`),
  CONSTRAINT `application_locations_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_locations`
--

LOCK TABLES `application_locations` WRITE;
/*!40000 ALTER TABLE `application_locations` DISABLE KEYS */;
INSERT INTO `application_locations` VALUES ('a2e6ccb9-436a-4f5b-a096-63d4cd6fc25c','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Sitio Riverside','Malobago','Magarao','Camarines Sur','4404','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2f0505e-448f-43b6-9446-6e477cebef03','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Commercial Center','San Isidro','Magarao','Camarines Sur','4404','2026-10-09 07:17:22','2026-10-09 07:17:22');
/*!40000 ALTER TABLE `application_locations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_property_details`
--

DROP TABLE IF EXISTS `application_property_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_property_details` (
  `id` char(36) NOT NULL,
  `application_id` char(36) NOT NULL,
  `pin` varchar(255) NOT NULL,
  `arp_number` varchar(255) NOT NULL,
  `land_classification` varchar(255) NOT NULL,
  `actual_use` varchar(255) NOT NULL,
  `total_area` decimal(12,2) NOT NULL,
  `survey_number` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_property_details_application_id_unique` (`application_id`),
  CONSTRAINT `application_property_details_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_property_details`
--

LOCK TABLES `application_property_details` WRITE;
/*!40000 ALTER TABLE `application_property_details` DISABLE KEYS */;
INSERT INTO `application_property_details` VALUES ('a2e6ccb9-41c3-430e-92a6-9b31a9e31a1f','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','010-33-444-555','010-33-444','Agricultural','Agricultural',1500.00,'SUR-2023-088','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2f0505e-40e0-4b68-aa3c-9a849a4f879c','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','010-02-0001-000-00','010-02-0001','Commercial','Commercial',450.00,'SUR-2023-012','2026-10-09 07:17:22','2026-10-09 07:17:22');
/*!40000 ALTER TABLE `application_property_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_status_history`
--

DROP TABLE IF EXISTS `application_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_status_history` (
  `id` char(36) NOT NULL,
  `application_id` char(36) NOT NULL,
  `from_status` varchar(255) DEFAULT NULL,
  `to_status` varchar(255) NOT NULL,
  `actor_id` char(36) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `application_status_history_application_id_foreign` (`application_id`),
  KEY `application_status_history_actor_id_foreign` (`actor_id`),
  CONSTRAINT `application_status_history_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `application_status_history_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_status_history`
--

LOCK TABLES `application_status_history` WRITE;
/*!40000 ALTER TABLE `application_status_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `application_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `application_technical_data`
--

DROP TABLE IF EXISTS `application_technical_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `application_technical_data` (
  `id` char(36) NOT NULL,
  `application_id` char(36) NOT NULL,
  `north_boundary` varchar(255) DEFAULT NULL,
  `south_boundary` varchar(255) DEFAULT NULL,
  `east_boundary` varchar(255) DEFAULT NULL,
  `west_boundary` varchar(255) DEFAULT NULL,
  `area_measurement` varchar(255) DEFAULT NULL,
  `survey_reference` varchar(255) DEFAULT NULL,
  `building_type` varchar(255) DEFAULT NULL,
  `floors` varchar(255) DEFAULT NULL,
  `building_area` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_technical_data_application_id_unique` (`application_id`),
  CONSTRAINT `application_technical_data_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `application_technical_data`
--

LOCK TABLES `application_technical_data` WRITE;
/*!40000 ALTER TABLE `application_technical_data` DISABLE KEYS */;
INSERT INTO `application_technical_data` VALUES ('a2e6ccb9-44fe-4f4f-9da0-57deb141ccb7','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','Creek','Rice field','Road','Lot 12','1500','SGO-2023-088','Wood','1','45','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2f0505e-45f2-4038-8120-4bcb8f7b3ceb','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','Main Road','Lot 5','Lot 6','Lot 4','450','SGO-2023-012','Concrete','2','200','2026-10-09 07:17:22','2026-10-09 07:17:22');
/*!40000 ALTER TABLE `application_technical_data` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications`
--

DROP TABLE IF EXISTS `applications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `applications` (
  `id` char(36) NOT NULL,
  `intake_ref` varchar(255) NOT NULL,
  `taxpayer_id` char(36) DEFAULT NULL,
  `taxpayer_name` varchar(255) NOT NULL,
  `property_type` varchar(255) NOT NULL,
  `barangay` varchar(255) NOT NULL,
  `submission_date` date NOT NULL,
  `status` varchar(255) NOT NULL,
  `verification_status` varchar(255) NOT NULL DEFAULT 'Pending',
  `last_assessor_action` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `tax_exempt` tinyint(1) NOT NULL DEFAULT 0,
  `exemption_notes` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `applications_intake_ref_unique` (`intake_ref`),
  KEY `applications_created_by_foreign` (`created_by`),
  KEY `applications_status_index` (`status`),
  KEY `applications_taxpayer_id_index` (`taxpayer_id`),
  CONSTRAINT `applications_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `applications_taxpayer_id_foreign` FOREIGN KEY (`taxpayer_id`) REFERENCES `taxpayers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications`
--

LOCK TABLES `applications` WRITE;
/*!40000 ALTER TABLE `applications` DISABLE KEYS */;
INSERT INTO `applications` VALUES ('a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','INT-2024-001',NULL,'Juan Dela Cruz','Residential','Poblacion','2024-01-15','Under_Review','Verified','Pending Review','',0,NULL,'a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','INT-2024-002','a2f04eb8-14c2-435f-8c79-4258c468dfcc','Maria Santos','Commercial','San Isidro','2024-01-10','Active','Verified','Activated','All documents complete',0,NULL,'a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,'2026-10-04 13:46:48','2026-10-09 07:12:45'),('a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','INT-2024-003','a2e6ccb9-3faf-470f-997b-8704758114ac','Reyes, Pedro Santos','Agricultural','Malobago','2024-01-20','Returned','Verified','Returned','Missing tax declaration document',0,NULL,'a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','INT-2024-004',NULL,'Ana Torres','Residential','Oas','2024-01-18','Draft','Pending',NULL,'',0,NULL,'a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','INT-2024-005',NULL,'Roberto Garcia','Commercial','Tumaring','2024-01-12','Active','Verified','Activated','Property activated for taxation',0,NULL,'a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,'2026-10-04 13:46:48','2026-10-04 14:20:00'),('a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','INT-2024-006',NULL,'Carmen Alves','Residential','Bagtasin','2024-01-22','Rejected','Verified','Rejected','Inconsistent property details and ownership claims',0,NULL,'a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6471-47e8-9fbd-7276b18264de','INT-2024-007',NULL,'Elena Bautista','Residential','Poblacion','2024-01-24','Under_Review','Verified','Pending Review','',1,'Senior citizen','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-6c16-449f-83fa-25008a190dc4','INT-2024-008',NULL,'Miguel Fernandez','Commercial','San Isidro','2024-01-24','Under_Review','Verified','Pending Review','',0,NULL,'a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48');
/*!40000 ALTER TABLE `applications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `applications_intake_seq`
--

DROP TABLE IF EXISTS `applications_intake_seq`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `applications_intake_seq` (
  `year` smallint(5) unsigned NOT NULL,
  `last_seq` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `applications_intake_seq`
--

LOCK TABLES `applications_intake_seq` WRITE;
/*!40000 ALTER TABLE `applications_intake_seq` DISABLE KEYS */;
INSERT INTO `applications_intake_seq` VALUES (2024,8);
/*!40000 ALTER TABLE `applications_intake_seq` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessment_items`
--

DROP TABLE IF EXISTS `assessment_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assessment_items` (
  `id` char(36) NOT NULL,
  `assessment_id` char(36) NOT NULL,
  `item_type` varchar(255) NOT NULL,
  `classification` varchar(255) NOT NULL,
  `actual_use` varchar(255) NOT NULL,
  `area_sqm` decimal(12,2) NOT NULL DEFAULT 0.00,
  `unit_value` decimal(12,2) NOT NULL DEFAULT 0.00,
  `base_market_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `adjustment_factor_pct` decimal(8,2) NOT NULL DEFAULT 0.00,
  `market_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `assessment_level_pct` decimal(5,2) NOT NULL DEFAULT 0.00,
  `assessed_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `assessment_items_assessment_id_foreign` (`assessment_id`),
  CONSTRAINT `assessment_items_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_items`
--

LOCK TABLES `assessment_items` WRITE;
/*!40000 ALTER TABLE `assessment_items` DISABLE KEYS */;
INSERT INTO `assessment_items` VALUES ('a2e6ccb9-8f02-44d8-b1f9-2f02144aae53','a2e6ccb9-8ba3-4998-9356-50c63c5875e5','Land','Residential','Residential',300.00,4500.00,1350000.00,0.00,1350000.00,20.00,270000.00,'[]','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-8fdc-491f-856a-8beb03d170a8','a2e6ccb9-8ba3-4998-9356-50c63c5875e5','Building','Residential','Residential',120.00,8500.00,1020000.00,0.00,969000.00,20.00,193800.00,'{\"depreciation_pct\":5}','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-9b02-4762-903a-c17b8c87c8a2','a2e6ccb9-99b8-41ca-af69-45f778bc0cca','Land','Commercial','Commercial',450.00,15000.00,6750000.00,10.00,7425000.00,50.00,3712500.00,'[]','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-9b6f-4112-9bb7-657fe19daa2c','a2e6ccb9-99b8-41ca-af69-45f778bc0cca','Building','Commercial','Commercial',200.00,18000.00,3600000.00,0.00,3240000.00,50.00,1620000.00,'{\"depreciation_pct\":10}','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-aa9f-4a0c-9892-e83ad44b7964','a2e6ccb9-a9dc-49c6-a471-0f98bec06764','Land','Agricultural','Agricultural',1500.00,950.00,1425000.00,-5.00,1353750.00,40.00,541500.00,'[]','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-ae9b-4ee1-985e-31567070fbf1','a2e6ccb9-adf2-426c-a435-35955f95bf14','Land','Residential','Residential',300.00,4500.00,1350000.00,0.00,1350000.00,20.00,270000.00,'[]','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-aeea-43fa-af1c-5183f9ba3e37','a2e6ccb9-adf2-426c-a435-35955f95bf14','Building','Residential','Residential',120.00,8500.00,1020000.00,0.00,969000.00,20.00,193800.00,'{\"depreciation_pct\":5}','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-b35c-4905-9633-517fa3ea66c2','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961','Land','Commercial','Commercial',450.00,15000.00,6750000.00,10.00,7425000.00,50.00,3712500.00,'[]','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-b3d5-4cec-8df6-1e0819082476','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961','Building','Commercial','Commercial',200.00,18000.00,3600000.00,0.00,3240000.00,50.00,1620000.00,'{\"depreciation_pct\":10}','2026-10-04 13:46:49','2026-10-04 13:46:49'),('a2e6ccb9-c1a1-4f17-b151-868beaace5e3','a2e6ccb9-c0ea-4f0d-a953-7db7eec9af41','Land','Residential','Residential',300.00,4500.00,1350000.00,0.00,1350000.00,20.00,270000.00,'[]','2026-10-04 13:46:49','2026-10-04 13:46:49'),('a2e6ccb9-c207-4bdb-a395-e9564a8230c9','a2e6ccb9-c0ea-4f0d-a953-7db7eec9af41','Building','Residential','Residential',120.00,8500.00,1020000.00,0.00,969000.00,20.00,193800.00,'{\"depreciation_pct\":5}','2026-10-04 13:46:49','2026-10-04 13:46:49'),('a2e6ccb9-c664-4e85-8a7b-c7af3151cb71','a2e6ccb9-c5ac-4503-8fb9-c34faa5c82eb','Land','Residential','Residential',300.00,4500.00,1350000.00,0.00,1350000.00,20.00,270000.00,'[]','2026-10-04 13:46:49','2026-10-04 13:46:49'),('a2e6ccb9-c6b1-4302-ab9f-93b813e622dd','a2e6ccb9-c5ac-4503-8fb9-c34faa5c82eb','Building','Residential','Residential',120.00,8500.00,1020000.00,0.00,969000.00,20.00,193800.00,'{\"depreciation_pct\":5}','2026-10-04 13:46:49','2026-10-04 13:46:49'),('a2e6ccb9-cd92-4670-816f-4260895f5b09','a2e6ccb9-cce0-440b-b821-00a1c02f126b','Land','Commercial','Commercial',450.00,15000.00,6750000.00,10.00,7425000.00,50.00,3712500.00,'[]','2026-10-04 13:46:49','2026-10-04 13:46:49'),('a2e6ccb9-cdff-4d72-8263-d95981e41454','a2e6ccb9-cce0-440b-b821-00a1c02f126b','Building','Commercial','Commercial',200.00,18000.00,3600000.00,0.00,3240000.00,50.00,1620000.00,'{\"depreciation_pct\":10}','2026-10-04 13:46:49','2026-10-04 13:46:49');
/*!40000 ALTER TABLE `assessment_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessment_status_histories`
--

DROP TABLE IF EXISTS `assessment_status_histories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assessment_status_histories` (
  `id` char(36) NOT NULL,
  `assessment_id` char(36) NOT NULL,
  `from_status` varchar(255) DEFAULT NULL,
  `to_status` varchar(255) NOT NULL,
  `actor_id` char(36) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `assessment_status_histories_assessment_id_foreign` (`assessment_id`),
  KEY `assessment_status_histories_actor_id_foreign` (`actor_id`),
  CONSTRAINT `assessment_status_histories_actor_id_foreign` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assessment_status_histories_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessment_status_histories`
--

LOCK TABLES `assessment_status_histories` WRITE;
/*!40000 ALTER TABLE `assessment_status_histories` DISABLE KEYS */;
INSERT INTO `assessment_status_histories` VALUES ('a2e6ccb9-9106-4d53-8474-9caaa8c7e3a3','a2e6ccb9-8ba3-4998-9356-50c63c5875e5',NULL,'Draft','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment draft created/updated by clerk','2026-10-04 13:46:48'),('a2e6ccb9-96d1-43cd-9f3a-da0b1d0c3f82','a2e6ccb9-8ba3-4998-9356-50c63c5875e5','Draft','UnderReview','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment submitted for Municipal Assessor review','2026-10-04 13:46:48'),('a2e6ccb9-9bcd-400d-9a82-456d1e4da6ce','a2e6ccb9-99b8-41ca-af69-45f778bc0cca',NULL,'Draft','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment draft created/updated by clerk','2026-10-04 13:46:48'),('a2e6ccb9-9f97-4f68-8200-472699a7ea86','a2e6ccb9-99b8-41ca-af69-45f778bc0cca','Draft','UnderReview','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment submitted for Municipal Assessor review','2026-10-04 13:46:48'),('a2e6ccb9-a282-4665-8018-da1299009861','a2e6ccb9-99b8-41ca-af69-45f778bc0cca','UnderReview','Approved','a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','Approved and verified','2026-10-04 13:46:48'),('a2e6ccb9-a7c5-4882-99d9-fcc0bf7a02be','a2e6ccb9-99b8-41ca-af69-45f778bc0cca','Approved','Authorized','a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','Authorized Tax Declaration TD-2026-0001','2026-10-04 13:46:48'),('a2e6ccb9-ab11-4fa5-895e-c9c3bd0a367c','a2e6ccb9-a9dc-49c6-a471-0f98bec06764',NULL,'Draft','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment draft created/updated by clerk','2026-10-04 13:46:48'),('a2e6ccb9-af3c-47dd-865a-066535e03cbf','a2e6ccb9-adf2-426c-a435-35955f95bf14',NULL,'Draft','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment draft created/updated by clerk','2026-10-04 13:46:48'),('a2e6ccb9-b44d-499f-8883-d4918a73e01c','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961',NULL,'Draft','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment draft created/updated by clerk','2026-10-04 13:46:49'),('a2e6ccb9-b7c6-467b-9a94-8f3d28010955','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961','Draft','UnderReview','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment submitted for Municipal Assessor review','2026-10-04 13:46:49'),('a2e6ccb9-ba1f-4857-93a0-c36c78d86a56','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961','UnderReview','Approved','a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','Approved and verified','2026-10-04 13:46:49'),('a2e6ccb9-bf0c-468a-b028-1c2a765b46e4','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961','Approved','Authorized','a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','Authorized Tax Declaration TD-2026-0002','2026-10-04 13:46:49'),('a2e6ccb9-c279-4900-824f-1b5ae5b55089','a2e6ccb9-c0ea-4f0d-a953-7db7eec9af41',NULL,'Draft','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment draft created/updated by clerk','2026-10-04 13:46:49'),('a2e6ccb9-c6ff-47bd-9a81-0820db3e08d2','a2e6ccb9-c5ac-4503-8fb9-c34faa5c82eb',NULL,'Draft','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment draft created/updated by clerk','2026-10-04 13:46:49'),('a2e6ccb9-c9bf-4101-b289-7d22b514b765','a2e6ccb9-c5ac-4503-8fb9-c34faa5c82eb','Draft','UnderReview','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment submitted for Municipal Assessor review','2026-10-04 13:46:49'),('a2e6ccb9-ce69-4b0d-a277-2067cd661a58','a2e6ccb9-cce0-440b-b821-00a1c02f126b',NULL,'Draft','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment draft created/updated by clerk','2026-10-04 13:46:49'),('a2e6ccb9-d141-4a03-bdfd-70b2140d5726','a2e6ccb9-cce0-440b-b821-00a1c02f126b','Draft','UnderReview','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','Assessment submitted for Municipal Assessor review','2026-10-04 13:46:49');
/*!40000 ALTER TABLE `assessment_status_histories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assessments`
--

DROP TABLE IF EXISTS `assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `assessments` (
  `id` char(36) NOT NULL,
  `application_id` char(36) NOT NULL,
  `pin` varchar(255) DEFAULT NULL,
  `arp_number` varchar(255) DEFAULT NULL,
  `total_market_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_assessed_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `taxability_status` varchar(255) NOT NULL DEFAULT 'Taxable',
  `exemption_reason` varchar(255) DEFAULT NULL,
  `effective_year` int(11) NOT NULL DEFAULT 2024,
  `effective_quarter` int(11) NOT NULL DEFAULT 1,
  `status` varchar(255) NOT NULL DEFAULT 'Draft',
  `remarks` text DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` char(36) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `authorized_by` char(36) DEFAULT NULL,
  `authorized_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assessments_application_id_unique` (`application_id`),
  KEY `assessments_created_by_foreign` (`created_by`),
  KEY `assessments_reviewed_by_foreign` (`reviewed_by`),
  KEY `assessments_authorized_by_foreign` (`authorized_by`),
  CONSTRAINT `assessments_application_id_foreign` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessments_authorized_by_foreign` FOREIGN KEY (`authorized_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assessments_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assessments_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assessments`
--

LOCK TABLES `assessments` WRITE;
/*!40000 ALTER TABLE `assessments` DISABLE KEYS */;
INSERT INTO `assessments` VALUES ('a2e6ccb9-8ba3-4998-9356-50c63c5875e5','a2e6ccb9-29ad-486f-8ade-8f7c4ea7870e','010-01-0001-000-00','010-01-0001',2319000.00,463800.00,'Taxable',NULL,2024,1,'UnderReview','','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','2026-10-04 13:46:48',NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-99b8-41ca-af69-45f778bc0cca','a2e6ccb9-3608-43ab-b5fe-a09aae5a42f3','010-01-0001-000-00','010-01-0001',10665000.00,5332500.00,'Taxable',NULL,2024,1,'Authorized','Approved and verified','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','2026-10-04 13:46:48','a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','2026-10-04 13:46:48','a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','2026-10-04 13:46:48','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-a9dc-49c6-a471-0f98bec06764','a2e6ccb9-3e14-42fa-82b6-7acf5c87e313','010-33-444-555','010-33-444',1353750.00,541500.00,'Taxable',NULL,2024,1,'Draft','','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-adf2-426c-a435-35955f95bf14','a2e6ccb9-4cb8-48b7-bf87-0df5a0b840db','010-01-0001-000-00','010-01-0001',2319000.00,463800.00,'Taxable',NULL,2024,1,'Draft','','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961','a2e6ccb9-5482-48e3-b3f9-3c58b393b71b','010-01-0001-000-00','010-01-0001',10665000.00,5332500.00,'Taxable',NULL,2024,1,'Authorized','Approved and verified','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','2026-10-04 13:46:49','a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','2026-10-04 13:46:49','a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','2026-10-04 13:46:49','2026-10-04 13:46:48','2026-10-04 13:46:49'),('a2e6ccb9-c0ea-4f0d-a953-7db7eec9af41','a2e6ccb9-5c67-49c5-9cf9-4f0b3ca011c0','010-01-0001-000-00','010-01-0001',2319000.00,463800.00,'Taxable',NULL,2024,1,'Draft','','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b',NULL,NULL,NULL,NULL,NULL,'2026-10-04 13:46:49','2026-10-04 13:46:49'),('a2e6ccb9-c5ac-4503-8fb9-c34faa5c82eb','a2e6ccb9-6471-47e8-9fbd-7276b18264de','010-01-0001-000-00','010-01-0001',2319000.00,0.00,'Exempt','Senior citizen',2024,1,'UnderReview','','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','2026-10-04 13:46:49',NULL,NULL,NULL,NULL,'2026-10-04 13:46:49','2026-10-04 13:46:49'),('a2e6ccb9-cce0-440b-b821-00a1c02f126b','a2e6ccb9-6c16-449f-83fa-25008a190dc4','010-01-0001-000-00','010-01-0001',10665000.00,5332500.00,'Taxable',NULL,2024,1,'UnderReview','','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','2026-10-04 13:46:49',NULL,NULL,NULL,NULL,'2026-10-04 13:46:49','2026-10-04 13:46:49');
/*!40000 ALTER TABLE `assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `audit_logs` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `user_name` varchar(255) NOT NULL,
  `action` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Success',
  `previous_value` varchar(255) DEFAULT NULL,
  `new_value` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES ('a2e6d8d5-1b6b-46ed-840f-ecb30a31ac0f','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Tax Bill','Success','-','BILL-BILL-2024-00001','2026-10-04 14:20:40','2026-10-04 14:20:40'),('a2e6d8d5-233b-435e-b0a2-5995e4a04f5b','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Tax Bill','Success','-','BILL-BILL-2025-00001','2026-10-04 14:20:40','2026-10-04 14:20:40'),('a2e6d8d5-2a51-44b0-922e-2af5f8f3c252','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Tax Bill','Success','-','BILL-BILL-2026-00001','2026-10-04 14:20:40','2026-10-04 14:20:40'),('a2e6d8d5-3401-4b15-832e-97073c4b720d','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Tax Bill','Success','-','BILL-BILL-2024-00002','2026-10-04 14:20:40','2026-10-04 14:20:40'),('a2e6d8d5-3c8c-4644-b394-ed8f221583d1','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Tax Bill','Success','-','BILL-BILL-2025-00002','2026-10-04 14:20:40','2026-10-04 14:20:40'),('a2e6d8d5-425a-47ba-b220-685c791fce4a','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Tax Bill','Success','-','BILL-BILL-2026-00002','2026-10-04 14:20:40','2026-10-04 14:20:40'),('a2e6d8fd-7c4c-4fe2-b817-cbee81872511','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Statement of Account','Success','-','SOA-SOA-2026-00001','2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7eab-44ab-a47a-a77c6e345dda','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','Ramon Gomez','Approved SOA Penalties','Success','SOA-SOA-2026-00001','Issued','2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-8bdd-4d7a-9d99-b6dc3744fb60','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Patricia Diaz','Recorded Payment & Issued OR','Success','OR-OR-2026-000001','Paid PHP 50000.00','2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-9740-4e9c-bf23-db278eb42a5c','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Statement of Account','Success','-','SOA-SOA-2026-00002','2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6df5d-5972-4d6e-b54d-d61070d458d7','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Statement of Account','Success','-','SOA-2026-00003','2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6e0ee-eaf4-467e-8f98-aa9ba6b2850b','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','Ramon Gomez','Approved SOA Penalties','Success','SOA-2026-00003','Issued','2026-10-04 14:43:19','2026-10-04 14:43:19'),('a2e6e24a-47f9-45e3-8f65-45d918d6ae6f','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Patricia Diaz','Recorded Payment & Issued OR','Success','OR-2026-000002','Paid PHP 422867.25','2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e9c2-46c7-4a91-be40-beaf049117f4','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Patricia Diaz','Recorded Payment & Issued OR','Success','OR-2026-000003','Paid PHP 396204.75','2026-10-04 15:08:00','2026-10-04 15:08:00'),('a2e6f151-851b-4568-852c-68d4f1499935','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Patricia Diaz','Requested Payment Correction','Success','OR-OR-2026-000001','This is just a sample tansaction','2026-10-04 15:29:08','2026-10-04 15:29:08'),('a2e6f18d-c505-4471-9f42-5cada91c2b04','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','Ramon Gomez','Approved Payment Cancellation','Success','OR-OR-2026-000001','Cancelled','2026-10-04 15:29:47','2026-10-04 15:29:47'),('a2efe7c2-2527-4254-b641-f09242c90f7c','a2e6d896-ab44-4d8c-9709-cffab9c0e141','Elena Reyes','Generated Statement of Account','Success','-','SOA-2026-00004','2026-10-09 02:24:51','2026-10-09 02:24:51'),('a2efe7c2-2829-4c44-ad94-0bd9cda00fd5','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','Ramon Gomez','Approved SOA Penalties','Success','SOA-2026-00004','Issued','2026-10-09 02:24:51','2026-10-09 02:24:51'),('a2efe7c2-33d6-40c0-a405-bde386f68787','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Patricia Diaz','Recorded Payment & Issued OR','Success','OR-2026-000004','Paid PHP 44259.75','2026-10-09 02:24:51','2026-10-09 02:24:51'),('a2f09610-5474-4cf0-8fe3-cec6827c59d3','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Reset Staff Password','Success','cashier','Password reset by administrator for staff member Patricia Diaz (Cashier)','2026-10-09 10:32:15','2026-10-09 10:32:15'),('a2f0962a-ac60-4d1b-ad32-a4dec6a92c08','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Reset Staff Password','Success','cashier','Password reset by administrator for staff member Patricia Diaz (Cashier)','2026-10-09 10:32:32','2026-10-09 10:32:32'),('a2f0962b-4746-4148-ae72-49bcf1990331','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Updated Statutory Billing Settings','Success','Municipal Ordinance No. 2026-009','Bill/Ordinance: Municipal Ordinance No. 2026-009 | Note: Basic real property tax adjusted to 1.2% pursuant to Sanggunian Bayan Resolution 45 to fund local infrastructure.','2026-10-09 10:32:32','2026-10-09 10:32:32'),('a2f09829-c892-4337-80fc-87e48bd1a389','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Updated User Status','Success','active','locked','2026-10-09 10:38:07','2026-10-09 10:38:07'),('a2f0982d-1a13-4a65-b1ac-b5085b7f64af','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Updated User Status','Success','locked','locked','2026-10-09 10:38:09','2026-10-09 10:38:09'),('a2f09830-6c9a-43fc-b8bd-da1e1b6ab211','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Updated User Status','Success','locked','active','2026-10-09 10:38:11','2026-10-09 10:38:11'),('a2f0983e-6640-4fa3-ac47-4acbc5870f67','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Updated User Status','Success','active','locked','2026-10-09 10:38:20','2026-10-09 10:38:20'),('a2f0985d-73bc-48c5-93bb-dc602b3e250e','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Updated User Status','Success','locked','active','2026-10-09 10:38:41','2026-10-09 10:38:41'),('a2f09f20-f58b-428a-8f72-4a1265563241','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Updated Statutory Billing Settings','Success','Municipal Ordinance No. 2026-009','Bill/Ordinance: Municipal Ordinance No. 2026-009 | Note: Basic real property tax adjusted to 1.2% pursuant to Sanggunian Bayan Resolution 45 to fund local infrastructure.','2026-10-09 10:57:35','2026-10-09 10:57:35'),('a2f09f22-8a3b-48c2-8940-3c505058e72a','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Updated Statutory Billing Settings','Success','Municipal Ordinance No. 2026-009','Bill/Ordinance: Municipal Ordinance No. 2026-009 | Note: Basic real property tax adjusted to 1.2% pursuant to Sanggunian Bayan Resolution 45 to fund local infrastructure.','2026-10-09 10:57:36','2026-10-09 10:57:36'),('a2f09f9f-6604-4813-870a-450e0a49bc43','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','Admin User','Updated Statutory Billing Settings','Success','Statutory Tax Rate','Bill/Ordinance: Statutory Tax Rate | Note: This is the current use of the entire Philippines','2026-10-09 10:58:58','2026-10-09 10:58:58');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `billing_sequences`
--

DROP TABLE IF EXISTS `billing_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `billing_sequences` (
  `key` varchar(255) NOT NULL,
  `last_seq` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `billing_sequences`
--

LOCK TABLES `billing_sequences` WRITE;
/*!40000 ALTER TABLE `billing_sequences` DISABLE KEYS */;
INSERT INTO `billing_sequences` VALUES ('BILL-2024',2),('BILL-2025',2),('BILL-2026',2),('OR-2026',4),('SOA-2026',4);
/*!40000 ALTER TABLE `billing_sequences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'0001_01_01_000003_create_personal_access_tokens_table',1),(5,'2024_01_01_000010_create_domain_tables',1),(6,'2024_01_01_000020_create_assessment_tables',1),(7,'2026_10_04_000100_add_taxpayer_id_to_users_table',2),(8,'2026_10_04_000200_create_billing_tables',2),(9,'2026_10_09_000300_create_user_notifications_table',3);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_allocations`
--

DROP TABLE IF EXISTS `payment_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_allocations` (
  `id` char(36) NOT NULL,
  `payment_id` char(36) NOT NULL,
  `tax_bill_installment_id` char(36) NOT NULL,
  `taxable_year` smallint(5) unsigned NOT NULL,
  `quarter` tinyint(3) unsigned NOT NULL,
  `basic_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `sef_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `penalty_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `discount_type` varchar(255) DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_allocations_payment_id_foreign` (`payment_id`),
  KEY `payment_allocations_tax_bill_installment_id_foreign` (`tax_bill_installment_id`),
  CONSTRAINT `payment_allocations_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_allocations_tax_bill_installment_id_foreign` FOREIGN KEY (`tax_bill_installment_id`) REFERENCES `tax_bill_installments` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_allocations`
--

LOCK TABLES `payment_allocations` WRITE;
/*!40000 ALTER TABLE `payment_allocations` DISABLE KEYS */;
INSERT INTO `payment_allocations` VALUES ('a2e6d8fd-8698-4611-82a4-4f059bbb3b15','a2e6d8fd-855c-4f37-a4f5-c46c36a938df','a2e6d8d5-1836-4161-89af-16b3340813e5',2024,1,13331.25,13331.25,17597.25,0.00,NULL,44259.75,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-89b1-4d18-84db-857fd1b71879','a2e6d8fd-855c-4f37-a4f5-c46c36a938df','a2e6d8d5-192f-480b-98a7-2690fe00f080',2024,2,0.00,0.00,5740.25,0.00,NULL,5740.25,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6e249-fa24-40eb-b1d3-f92212e7d822','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-30b6-4580-829f-4211ae622ba5',2024,1,13331.25,13331.25,17597.25,0.00,NULL,44259.75,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-0617-4d3f-8361-41db64b37e1d','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-3161-4a30-acc5-007179c15ee4',2024,2,13331.25,13331.25,15997.50,0.00,NULL,42660.00,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-0d77-481a-b210-452ff3a99fb1','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-32c5-4c60-8210-6ad9c07a7b15',2024,3,13331.25,13331.25,14397.75,0.00,NULL,41060.25,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-1349-4155-9e75-cc3b16829ab7','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-3348-478e-bef5-dfc2b69df9ca',2024,4,13331.25,13331.25,12798.00,0.00,NULL,39460.50,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-1a2d-4bb7-96d8-ff825c054067','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-3a75-440e-af42-01f4f521d9a8',2025,1,13331.25,13331.25,11198.25,0.00,NULL,37860.75,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-200c-4037-8fe8-8527ea3f0981','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-3b18-442d-aa94-596018df4f25',2025,2,13331.25,13331.25,9598.50,0.00,NULL,36261.00,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-255f-4e70-870e-87abde6032a4','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-3bad-4e4d-87db-2a31c5cf6dd4',2025,3,13331.25,13331.25,7998.75,0.00,NULL,34661.25,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-2a80-43ec-9ac6-847dda60470b','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-3c20-4a64-be34-6a23a23b489e',2025,4,13331.25,13331.25,6399.00,0.00,NULL,33061.50,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-3046-4260-b9d5-31e904e25848','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-40c5-4abe-9cc6-4ee1e45b52bf',2026,1,13331.25,13331.25,4799.25,0.00,NULL,31461.75,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-3657-4411-adad-5b371a6b23fe','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-4116-44d5-9284-86d377fb9094',2026,2,13331.25,13331.25,3199.50,0.00,NULL,29862.00,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-3b66-43b9-a569-b7c755dbe53d','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-416d-4dc0-b154-33bf5bf14580',2026,3,13331.25,13331.25,1599.75,0.00,NULL,28262.25,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e24a-40b5-4e4f-89c3-2772d4d47e48','a2e6e249-f565-4efe-ae8b-63337b3a3916','a2e6d8d5-41db-43c9-b786-37f1bcde48fb',2026,4,13331.25,13331.25,0.00,2666.25,'Prompt',23996.25,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e9c2-182f-4a29-b657-9bb6f052df08','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-1836-4161-89af-16b3340813e5',2024,1,0.00,0.00,17597.25,0.00,NULL,17597.25,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-1c6f-44dd-bcdd-9f755e89ceea','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-192f-480b-98a7-2690fe00f080',2024,2,13331.25,13331.25,15997.50,0.00,NULL,42660.00,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-1fac-4198-9946-fffadff7a0ab','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-199f-44af-bf01-5bd8769d01aa',2024,3,13331.25,13331.25,14397.75,0.00,NULL,41060.25,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-2333-4475-b762-830a4a1b644d','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-1a9e-4ffb-802b-fa63600e73d4',2024,4,13331.25,13331.25,12798.00,0.00,NULL,39460.50,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-273c-4d89-a7f6-82128fcccb37','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-21c8-46b4-b843-b4c70e216e57',2025,1,13331.25,13331.25,11198.25,0.00,NULL,37860.75,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-2aec-4284-a29f-ee98a5a4fa96','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-221c-4f1f-9664-588669f5e9d7',2025,2,13331.25,13331.25,9598.50,0.00,NULL,36261.00,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-2f63-4fcb-8c3c-48d0e7f262ab','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-226a-4ec2-bf38-5d64b8db01ae',2025,3,13331.25,13331.25,7998.75,0.00,NULL,34661.25,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-3310-4ca2-86e5-4772f3310172','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-22b7-4ce3-87ef-eb8773fb2c88',2025,4,13331.25,13331.25,6399.00,0.00,NULL,33061.50,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-36ad-4084-be5d-09488115a4dc','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-2802-4aae-a7cc-0955319e2d1d',2026,1,13331.25,13331.25,4799.25,0.00,NULL,31461.75,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-3a3c-4d67-a107-3662b8b9fd6e','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-2891-4879-925a-f2fa6ce7b206',2026,2,13331.25,13331.25,3199.50,0.00,NULL,29862.00,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-3e37-40c6-b2a3-4c1139a72197','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-28fd-4ecb-a283-c0704aca6606',2026,3,13331.25,13331.25,1599.75,0.00,NULL,28262.25,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2e6e9c2-41f3-4762-bf94-a062a4a9128f','a2e6e9c2-1460-4ab3-8683-796a871ccccc','a2e6d8d5-297d-416c-83e3-83e13c47b111',2026,4,13331.25,13331.25,0.00,2666.25,'Prompt',23996.25,'2026-10-04 15:07:59','2026-10-04 15:07:59'),('a2efe7c2-2fa4-46e1-97d2-dcc45dcc3746','a2efe7c2-2df7-44b7-b277-24eab68e1fb5','a2e6d8d5-1836-4161-89af-16b3340813e5',2024,1,13331.25,13331.25,17597.25,0.00,NULL,44259.75,'2026-10-09 02:24:51','2026-10-09 02:24:51');
/*!40000 ALTER TABLE `payment_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_correction_requests`
--

DROP TABLE IF EXISTS `payment_correction_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_correction_requests` (
  `id` char(36) NOT NULL,
  `payment_id` char(36) NOT NULL,
  `request_type` varchar(255) NOT NULL DEFAULT 'Cancellation',
  `reason` text NOT NULL,
  `requested_by` char(36) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Pending',
  `reviewed_by` char(36) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_remarks` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payment_correction_requests_payment_id_foreign` (`payment_id`),
  KEY `payment_correction_requests_requested_by_foreign` (`requested_by`),
  KEY `payment_correction_requests_reviewed_by_foreign` (`reviewed_by`),
  KEY `payment_correction_requests_status_index` (`status`),
  CONSTRAINT `payment_correction_requests_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`),
  CONSTRAINT `payment_correction_requests_requested_by_foreign` FOREIGN KEY (`requested_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payment_correction_requests_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_correction_requests`
--

LOCK TABLES `payment_correction_requests` WRITE;
/*!40000 ALTER TABLE `payment_correction_requests` DISABLE KEYS */;
INSERT INTO `payment_correction_requests` VALUES ('a2e6f151-81e6-4868-9f28-1ad206f3bedd','a2e6d8fd-855c-4f37-a4f5-c46c36a938df','Cancellation','This is just a sample tansaction','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Approved','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','2026-10-04 15:29:47','Approved by Municipal Treasurer','2026-10-04 15:29:08','2026-10-04 15:29:47');
/*!40000 ALTER TABLE `payment_correction_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `or_number` varchar(255) NOT NULL,
  `statement_of_account_id` char(36) NOT NULL,
  `tax_declaration_id` char(36) NOT NULL,
  `taxpayer_id` char(36) DEFAULT NULL,
  `payor_name` varchar(255) NOT NULL,
  `barangay` varchar(255) NOT NULL,
  `payment_date` datetime NOT NULL,
  `amount_due` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `amount_paid` decimal(15,2) NOT NULL,
  `amount_tendered` decimal(15,2) NOT NULL,
  `change_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `balance_after` decimal(15,2) NOT NULL DEFAULT 0.00,
  `payment_method` varchar(255) NOT NULL DEFAULT 'Cash',
  `reference_no` varchar(255) DEFAULT NULL,
  `remarks` text DEFAULT NULL,
  `cashier_id` char(36) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Posted',
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancelled_by` char(36) DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  `replaces_payment_id` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_or_number_unique` (`or_number`),
  KEY `payments_statement_of_account_id_foreign` (`statement_of_account_id`),
  KEY `payments_tax_declaration_id_foreign` (`tax_declaration_id`),
  KEY `payments_taxpayer_id_foreign` (`taxpayer_id`),
  KEY `payments_cashier_id_foreign` (`cashier_id`),
  KEY `payments_cancelled_by_foreign` (`cancelled_by`),
  KEY `payments_status_payment_date_index` (`status`,`payment_date`),
  KEY `payments_replaces_payment_id_index` (`replaces_payment_id`),
  CONSTRAINT `payments_cancelled_by_foreign` FOREIGN KEY (`cancelled_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_cashier_id_foreign` FOREIGN KEY (`cashier_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_statement_of_account_id_foreign` FOREIGN KEY (`statement_of_account_id`) REFERENCES `statements_of_account` (`id`),
  CONSTRAINT `payments_tax_declaration_id_foreign` FOREIGN KEY (`tax_declaration_id`) REFERENCES `tax_declarations` (`id`),
  CONSTRAINT `payments_taxpayer_id_foreign` FOREIGN KEY (`taxpayer_id`) REFERENCES `taxpayers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES ('a2e6d8fd-855c-4f37-a4f5-c46c36a938df','OR-OR-2026-000001','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2f04eb8-14c2-435f-8c79-4258c468dfcc','Maria Santos','San Isidro','2026-10-04 22:21:06',425533.50,0.00,50000.00,50000.00,0.00,375533.50,'Cash',NULL,'Partial payment for 2024 real property taxes','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Cancelled','2026-10-04 15:29:47','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','This is just a sample tansaction',NULL,'2026-10-04 14:21:06','2026-10-09 07:12:45'),('a2e6e249-f565-4efe-ae8b-63337b3a3916','OR-2026-000002','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6ccb9-bdb6-45d8-bf79-2d51d76c9eb5',NULL,'Roberto Garcia','Tumaring','2026-10-04 00:00:00',422867.25,2666.25,422867.25,423000.00,132.75,0.00,'Cash',NULL,NULL,'a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Posted',NULL,NULL,NULL,NULL,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e9c2-1460-4ab3-8683-796a871ccccc','OR-2026-000003','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2f04eb8-14c2-435f-8c79-4258c468dfcc','Maria Santos','San Isidro','2026-10-04 00:00:00',396204.75,2666.25,396204.75,396204.75,0.00,0.00,'Cash',NULL,NULL,'a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Posted',NULL,NULL,NULL,NULL,'2026-10-04 15:07:59','2026-10-09 07:12:45'),('a2efe7c2-2df7-44b7-b277-24eab68e1fb5','OR-2026-000004','a2efe7c2-1f15-4f93-886a-161d18f972f6','a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2f04eb8-14c2-435f-8c79-4258c468dfcc','Maria Santos','San Isidro','2026-10-09 10:24:51',44259.75,0.00,44259.75,50000.00,5740.25,0.00,'Cash',NULL,'Partial payment for 2024 real property taxes','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','Posted',NULL,NULL,NULL,NULL,'2026-10-09 02:24:51','2026-10-09 07:12:45');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_id` char(36) NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','App\\Models\\User','api','024522a322e13eeff2890c2d686a4465d3c2700f87a01ef36072ec0ad3891c34','[\"*\"]',NULL,NULL,'2026-10-04 13:48:16','2026-10-04 13:48:16'),(12,'a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','App\\Models\\User','api','79ad21014bbdf9d05ffd55d7fd809227a68a2672e831eefc9f41ac5a36904981','[\"*\"]','2026-10-04 15:05:29',NULL,'2026-10-04 15:05:29','2026-10-04 15:05:29'),(14,'a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','App\\Models\\User','api','d40f55266a4d969328abf5f7d29f15789afdc107368619a2c5d62cf6b9ee18ba','[\"*\"]','2026-10-04 15:12:14',NULL,'2026-10-04 15:07:21','2026-10-04 15:12:14'),(15,'a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','App\\Models\\User','api','c9b4650e763272b8438e080ce6713dc2ac787ab6e5420135d9d0358215293604','[\"*\"]','2026-10-04 15:19:45',NULL,'2026-10-04 15:19:32','2026-10-04 15:19:45'),(21,'a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','App\\Models\\User','api','76e488a010a2d9f677fa4bba424153d55a448f758c5878761d6a5d80cd3c32cb','[\"*\"]','2026-10-09 04:02:24',NULL,'2026-10-04 15:36:01','2026-10-09 04:02:24'),(22,'a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','App\\Models\\User','api','492a3b54d788e017e17d2f38999f8d76025dff15bea5c3d85fd5e2ab968e2b91','[\"*\"]','2026-10-04 15:37:45',NULL,'2026-10-04 15:36:51','2026-10-04 15:37:45'),(23,'a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','App\\Models\\User','api','ce5cc950ef12c7892ca646fe0d6cc44035424924a513568a464a6624d81db79d','[\"*\"]',NULL,NULL,'2026-10-09 04:00:52','2026-10-09 04:00:52'),(33,'a2e6d897-c939-4d83-b452-1449a813e6a2','App\\Models\\User','api','558d70dfce22f99342c07edc71e763df9e066ff98fe13f6ac926f5a3214e00be','[\"*\"]','2026-10-09 07:13:52',NULL,'2026-10-09 07:13:52','2026-10-09 07:13:52'),(34,'a2e6d897-c939-4d83-b452-1449a813e6a2','App\\Models\\User','api','b1be9941d71f64e8ec75b4da88a041a17de8e657e929c2f8da7171794b5f71ea','[\"*\"]','2026-10-09 07:18:08',NULL,'2026-10-09 07:18:08','2026-10-09 07:18:08'),(35,'a2e6d897-c939-4d83-b452-1449a813e6a2','App\\Models\\User','api','18cefe0a96bd6211f00efd119b1429a2f84ff7536f8d5f79afdb8b7690f96dc5','[\"*\"]','2026-10-09 07:21:09',NULL,'2026-10-09 07:21:09','2026-10-09 07:21:09'),(39,'a2e6d896-ab44-4d8c-9709-cffab9c0e141','App\\Models\\User','api','75a92efd5b1beb4c1850dd75a6651058badbd3d30eace4f0697785fbdc1ec451','[\"*\"]','2026-10-09 08:13:44',NULL,'2026-10-09 08:13:44','2026-10-09 08:13:44'),(40,'a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','App\\Models\\User','api','3e4fb5aa891713dc29bf20f404916572da7482499b2aa0f6e280e1aa4dc0c780','[\"*\"]','2026-10-09 08:57:52',NULL,'2026-10-09 08:57:52','2026-10-09 08:57:52'),(41,'a2e6d897-c939-4d83-b452-1449a813e6a2','App\\Models\\User','api','1da608e6d6c3ab01ed1104545c86c175048d0840e09afcd67b8b75621e3df016','[\"*\"]','2026-10-09 08:58:28',NULL,'2026-10-09 08:58:28','2026-10-09 08:58:28'),(51,'a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','App\\Models\\User','api','db31ac81ce4b7249d4a29f766c1c4f19c326e0b3576a732ede0da556fc156b5d','[\"*\"]','2026-10-09 11:48:33',NULL,'2026-10-09 10:58:02','2026-10-09 11:48:33');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('PqxebLgmuVmh8kfWHpq4LNPp8DnLGvL0iZgfuiiU',NULL,'127.0.0.1','Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)','YTozOntzOjY6Il90b2tlbiI7czo0MDoiMVJkWmlqWG45ZDRDSlR1RWI1Q2xmQkt6bVRENUlpT3k0WUg5Tk1hcyI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1791121680),('WGirE7z9nBMNLD7s2r6psin2RoqGMvYhsHkr6D6J',NULL,'127.0.0.1','Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9444','YTozOntzOjY6Il90b2tlbiI7czo0MDoiWDJpeEd6R3VycEV6cmF5dGxZVzhGbkdMWW1XTDFyQnJ5d2g4cmFTeSI7czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=',1791121680);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `key` varchar(255) NOT NULL,
  `value` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`value`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES ('billing','{\"basicRatePct\":1,\"sefRatePct\":1,\"monthlyPenaltyPct\":2,\"maxPenaltyMonths\":36,\"advanceDiscountPct\":20,\"promptDiscountPct\":10,\"quarterDueDates\":[{\"quarter\":1,\"month\":1,\"day\":20},{\"quarter\":2,\"month\":4,\"day\":20},{\"quarter\":3,\"month\":7,\"day\":20},{\"quarter\":4,\"month\":10,\"day\":20}],\"orPrefix\":\"OR\",\"soaPrefix\":\"SOA\",\"billPrefix\":\"BILL\",\"partialMonthCountsFull\":true,\"billOrOrdinanceName\":\"Statutory Tax Rate\",\"changeNote\":\"This is the current use of the entire Philippines\",\"changedAt\":\"2026-10-09\",\"changedBy\":\"Admin User\",\"changeHistory\":[{\"billOrOrdinanceName\":\"Statutory Tax Rate\",\"changeNote\":\"This is the current use of the entire Philippines\",\"changedAt\":\"2026-10-09\",\"changedBy\":\"Admin User\",\"basicRatePct\":1,\"sefRatePct\":1,\"monthlyPenaltyPct\":2,\"maxPenaltyMonths\":36,\"advanceDiscountPct\":20,\"promptDiscountPct\":10,\"recordedAt\":\"2026-10-09T18:58:58+08:00\"},{\"billOrOrdinanceName\":\"Municipal Ordinance No. 2026-009\",\"changeNote\":\"Basic real property tax adjusted to 1.2% pursuant to Sanggunian Bayan Resolution 45 to fund local infrastructure.\",\"changedAt\":\"2026-10-09\",\"changedBy\":\"Admin User\",\"basicRatePct\":1.2,\"sefRatePct\":1,\"monthlyPenaltyPct\":2,\"maxPenaltyMonths\":36,\"advanceDiscountPct\":20,\"promptDiscountPct\":10,\"recordedAt\":\"2026-10-09T18:57:36+08:00\"},{\"billOrOrdinanceName\":\"Municipal Ordinance No. 2026-009\",\"changeNote\":\"Basic real property tax adjusted to 1.2% pursuant to Sanggunian Bayan Resolution 45 to fund local infrastructure.\",\"changedAt\":\"2026-10-09\",\"changedBy\":\"Admin User\",\"basicRatePct\":1.2,\"sefRatePct\":1,\"monthlyPenaltyPct\":2,\"maxPenaltyMonths\":36,\"advanceDiscountPct\":20,\"promptDiscountPct\":10,\"recordedAt\":\"2026-10-09T18:57:35+08:00\"},{\"billOrOrdinanceName\":\"Municipal Ordinance No. 2026-009\",\"changeNote\":\"Basic real property tax adjusted to 1.2% pursuant to Sanggunian Bayan Resolution 45 to fund local infrastructure.\",\"changedAt\":\"2026-10-09\",\"changedBy\":\"Admin User\",\"basicRatePct\":1.2,\"sefRatePct\":1,\"monthlyPenaltyPct\":2,\"maxPenaltyMonths\":36,\"advanceDiscountPct\":20,\"promptDiscountPct\":10,\"recordedAt\":\"2026-10-09T18:32:32+08:00\"}]}','2026-10-04 15:32:09','2026-10-09 10:58:58');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `smv_unit_values`
--

DROP TABLE IF EXISTS `smv_unit_values`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `smv_unit_values` (
  `id` char(36) NOT NULL,
  `barangay` varchar(255) NOT NULL,
  `classification` varchar(255) NOT NULL,
  `actual_use` varchar(255) NOT NULL,
  `unit_value` decimal(12,2) NOT NULL,
  `revision_year` int(11) NOT NULL DEFAULT 2024,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `smv_unique_key` (`barangay`,`classification`,`actual_use`,`revision_year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `smv_unit_values`
--

LOCK TABLES `smv_unit_values` WRITE;
/*!40000 ALTER TABLE `smv_unit_values` DISABLE KEYS */;
INSERT INTO `smv_unit_values` VALUES ('a2e6ccb9-75b1-49b8-89e1-7bb9c708921b','Poblacion','Residential','Residential',4500.00,2024,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-76b7-4b2d-a94d-5d4b6eb32dca','Poblacion','Commercial','Commercial',15000.00,2024,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-7813-44fe-9ac1-f07cf4c394b9','San Isidro','Residential','Residential',3200.00,2024,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-790a-496e-ba8a-920fb1ac59c7','San Isidro','Commercial','Commercial',10000.00,2024,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-7a09-4d3c-9e1b-5ad6af18742a','Malobago','Agricultural','Agricultural',950.00,2024,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-7af0-4ce0-9c1b-2d1eae27e266','Malobago','Residential','Residential',2100.00,2024,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-7bd7-4da4-8b1b-df64d3068783','Oas','Residential','Residential',2800.00,2024,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-7ca2-408b-b4f7-c87c1e66ea4e','Tumaring','Commercial','Commercial',11500.00,2024,'2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-7d92-419d-8a85-a36c1e88e9c6','Bagtasin','Residential','Residential',2500.00,2024,'2026-10-04 13:46:48','2026-10-04 13:46:48');
/*!40000 ALTER TABLE `smv_unit_values` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `soa_items`
--

DROP TABLE IF EXISTS `soa_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `soa_items` (
  `id` char(36) NOT NULL,
  `statement_of_account_id` char(36) NOT NULL,
  `tax_bill_installment_id` char(36) NOT NULL,
  `taxable_year` smallint(5) unsigned NOT NULL,
  `quarter` tinyint(3) unsigned NOT NULL,
  `due_date` date NOT NULL,
  `basic_balance` decimal(15,2) NOT NULL,
  `sef_balance` decimal(15,2) NOT NULL,
  `principal_balance` decimal(15,2) NOT NULL,
  `months_late` smallint(5) unsigned NOT NULL DEFAULT 0,
  `penalty_rate_pct` decimal(6,3) NOT NULL DEFAULT 0.000,
  `computed_penalty` decimal(15,2) NOT NULL DEFAULT 0.00,
  `penalty_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `adjustment_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `soa_items_statement_of_account_id_foreign` (`statement_of_account_id`),
  KEY `soa_items_tax_bill_installment_id_foreign` (`tax_bill_installment_id`),
  CONSTRAINT `soa_items_statement_of_account_id_foreign` FOREIGN KEY (`statement_of_account_id`) REFERENCES `statements_of_account` (`id`) ON DELETE CASCADE,
  CONSTRAINT `soa_items_tax_bill_installment_id_foreign` FOREIGN KEY (`tax_bill_installment_id`) REFERENCES `tax_bill_installments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `soa_items`
--

LOCK TABLES `soa_items` WRITE;
/*!40000 ALTER TABLE `soa_items` DISABLE KEYS */;
INSERT INTO `soa_items` VALUES ('a2e6d8fd-7713-42fc-980d-9b7da224a6a8','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-1836-4161-89af-16b3340813e5',2024,1,'2024-01-20',13331.25,13331.25,26662.50,33,66.000,17597.25,17597.25,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7800-4fb7-ad1a-05475b6f87b4','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-192f-480b-98a7-2690fe00f080',2024,2,'2024-04-20',13331.25,13331.25,26662.50,30,60.000,15997.50,15997.50,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-786a-426e-bff7-d6734d5642a2','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-199f-44af-bf01-5bd8769d01aa',2024,3,'2024-07-20',13331.25,13331.25,26662.50,27,54.000,14397.75,14397.75,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7915-4ba4-8aff-b9719c94ef2d','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-1a9e-4ffb-802b-fa63600e73d4',2024,4,'2024-10-20',13331.25,13331.25,26662.50,24,48.000,12798.00,12798.00,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7975-4446-83d6-924317c4bedb','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-21c8-46b4-b843-b4c70e216e57',2025,1,'2025-01-20',13331.25,13331.25,26662.50,21,42.000,11198.25,11198.25,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-79e6-4fac-b859-9f64a2111d1b','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-221c-4f1f-9664-588669f5e9d7',2025,2,'2025-04-20',13331.25,13331.25,26662.50,18,36.000,9598.50,9598.50,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7a4c-4243-a3f6-13b8ac0c9f7e','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-226a-4ec2-bf38-5d64b8db01ae',2025,3,'2025-07-20',13331.25,13331.25,26662.50,15,30.000,7998.75,7998.75,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7aae-4552-b6b9-14ee05e74186','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-22b7-4ce3-87ef-eb8773fb2c88',2025,4,'2025-10-20',13331.25,13331.25,26662.50,12,24.000,6399.00,6399.00,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7b09-4587-bb65-1ee211e5ff23','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-2802-4aae-a7cc-0955319e2d1d',2026,1,'2026-01-20',13331.25,13331.25,26662.50,9,18.000,4799.25,4799.25,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7b55-412f-8342-ce02daacc2c7','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-2891-4879-925a-f2fa6ce7b206',2026,2,'2026-04-20',13331.25,13331.25,26662.50,6,12.000,3199.50,3199.50,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7b8f-44ab-ba1e-860980c08bfc','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-28fd-4ecb-a283-c0704aca6606',2026,3,'2026-07-20',13331.25,13331.25,26662.50,3,6.000,1599.75,1599.75,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-7bc9-422d-bec2-2980ae73573d','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8d5-297d-416c-83e3-83e13c47b111',2026,4,'2026-10-20',13331.25,13331.25,26662.50,0,0.000,0.00,0.00,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-9321-4ec7-9a50-66539abf4b4b','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-30b6-4580-829f-4211ae622ba5',2024,1,'2024-01-20',13331.25,13331.25,26662.50,33,66.000,17597.25,17597.25,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-9363-46d9-8332-6e83b905eeca','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-3161-4a30-acc5-007179c15ee4',2024,2,'2024-04-20',13331.25,13331.25,26662.50,30,60.000,15997.50,15997.50,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-93a5-48f1-a20c-d1a58e1d9b1c','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-32c5-4c60-8210-6ad9c07a7b15',2024,3,'2024-07-20',13331.25,13331.25,26662.50,27,54.000,14397.75,14397.75,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-9404-4bae-a743-334f5203c0c8','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-3348-478e-bef5-dfc2b69df9ca',2024,4,'2024-10-20',13331.25,13331.25,26662.50,24,48.000,12798.00,12798.00,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-9519-4601-a160-a3fc7aaeec6c','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-3a75-440e-af42-01f4f521d9a8',2025,1,'2025-01-20',13331.25,13331.25,26662.50,21,42.000,11198.25,11198.25,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-9578-4ffb-9d3e-9a60ae9f1c7e','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-3b18-442d-aa94-596018df4f25',2025,2,'2025-04-20',13331.25,13331.25,26662.50,18,36.000,9598.50,9598.50,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-95b9-4230-be1a-bd1f5e571ec3','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-3bad-4e4d-87db-2a31c5cf6dd4',2025,3,'2025-07-20',13331.25,13331.25,26662.50,15,30.000,7998.75,7998.75,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-95f5-433f-b99a-6605598c2a2d','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-3c20-4a64-be34-6a23a23b489e',2025,4,'2025-10-20',13331.25,13331.25,26662.50,12,24.000,6399.00,6399.00,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-9632-46b8-9cc0-8d21a695db65','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-40c5-4abe-9cc6-4ee1e45b52bf',2026,1,'2026-01-20',13331.25,13331.25,26662.50,9,18.000,4799.25,4799.25,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-966e-4719-8887-59930e49f496','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-4116-44d5-9284-86d377fb9094',2026,2,'2026-04-20',13331.25,13331.25,26662.50,6,12.000,3199.50,3199.50,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-96a9-41e4-9365-ceb7990272dd','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-416d-4dc0-b154-33bf5bf14580',2026,3,'2026-07-20',13331.25,13331.25,26662.50,3,6.000,1599.75,1599.75,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-96eb-4c4a-8488-6c7d869e164a','a2e6d8fd-929f-4482-8388-f50dbabdee03','a2e6d8d5-41db-43c9-b786-37f1bcde48fb',2026,4,'2026-10-20',13331.25,13331.25,26662.50,0,0.000,0.00,0.00,NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6df5d-5129-4788-912d-17fd8bf2e2ae','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-30b6-4580-829f-4211ae622ba5',2024,1,'2024-01-20',13331.25,13331.25,26662.50,33,66.000,17597.25,17597.25,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-522a-4fc7-afa4-ba0d575fa520','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-3161-4a30-acc5-007179c15ee4',2024,2,'2024-04-20',13331.25,13331.25,26662.50,30,60.000,15997.50,15997.50,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-52be-43c1-96e1-b6287b8893e4','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-32c5-4c60-8210-6ad9c07a7b15',2024,3,'2024-07-20',13331.25,13331.25,26662.50,27,54.000,14397.75,14397.75,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-5358-40f1-b3e7-c2294a150344','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-3348-478e-bef5-dfc2b69df9ca',2024,4,'2024-10-20',13331.25,13331.25,26662.50,24,48.000,12798.00,12798.00,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-53f5-4aa5-865b-9834cd0f73c0','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-3a75-440e-af42-01f4f521d9a8',2025,1,'2025-01-20',13331.25,13331.25,26662.50,21,42.000,11198.25,11198.25,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-54ed-4d58-a8d0-59c2c8e0e5a7','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-3b18-442d-aa94-596018df4f25',2025,2,'2025-04-20',13331.25,13331.25,26662.50,18,36.000,9598.50,9598.50,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-5560-48e8-ad8e-5962bca05d8f','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-3bad-4e4d-87db-2a31c5cf6dd4',2025,3,'2025-07-20',13331.25,13331.25,26662.50,15,30.000,7998.75,7998.75,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-55ec-4215-9a16-96f43287eff7','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-3c20-4a64-be34-6a23a23b489e',2025,4,'2025-10-20',13331.25,13331.25,26662.50,12,24.000,6399.00,6399.00,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-5679-4485-aee2-b3d410660b1c','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-40c5-4abe-9cc6-4ee1e45b52bf',2026,1,'2026-01-20',13331.25,13331.25,26662.50,9,18.000,4799.25,4799.25,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-570e-4894-a2d7-43e851154208','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-4116-44d5-9284-86d377fb9094',2026,2,'2026-04-20',13331.25,13331.25,26662.50,6,12.000,3199.50,3199.50,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-57a2-4359-918e-ba932c6c5bb4','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-416d-4dc0-b154-33bf5bf14580',2026,3,'2026-07-20',13331.25,13331.25,26662.50,3,6.000,1599.75,1599.75,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2e6df5d-583b-467b-9661-87a4e3c3df56','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6d8d5-41db-43c9-b786-37f1bcde48fb',2026,4,'2026-10-20',13331.25,13331.25,26662.50,0,0.000,0.00,0.00,NULL,'2026-10-04 14:38:56','2026-10-04 14:38:56'),('a2efe7c2-2367-4188-af83-c40551c6b231','a2efe7c2-1f15-4f93-886a-161d18f972f6','a2e6d8d5-1836-4161-89af-16b3340813e5',2024,1,'2024-01-20',13331.25,13331.25,26662.50,33,66.000,17597.25,17597.25,NULL,'2026-10-09 02:24:51','2026-10-09 02:24:51');
/*!40000 ALTER TABLE `soa_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statements_of_account`
--

DROP TABLE IF EXISTS `statements_of_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `statements_of_account` (
  `id` char(36) NOT NULL,
  `soa_no` varchar(255) NOT NULL,
  `tax_declaration_id` char(36) NOT NULL,
  `taxpayer_id` char(36) DEFAULT NULL,
  `revision_of_id` char(36) DEFAULT NULL,
  `owner_name` varchar(255) NOT NULL,
  `pin` varchar(255) DEFAULT NULL,
  `td_number` varchar(255) NOT NULL,
  `barangay` varchar(255) NOT NULL,
  `as_of_date` date NOT NULL,
  `valid_until` date NOT NULL,
  `total_basic` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_sef` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_principal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `computed_penalty` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_penalty` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_amount_due` decimal(15,2) NOT NULL DEFAULT 0.00,
  `has_penalty` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(255) NOT NULL,
  `remarks` text DEFAULT NULL,
  `review_remarks` text DEFAULT NULL,
  `prepared_by` char(36) DEFAULT NULL,
  `reviewed_by` char(36) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT NULL,
  `notified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `statements_of_account_soa_no_unique` (`soa_no`),
  KEY `statements_of_account_tax_declaration_id_foreign` (`tax_declaration_id`),
  KEY `statements_of_account_taxpayer_id_foreign` (`taxpayer_id`),
  KEY `statements_of_account_prepared_by_foreign` (`prepared_by`),
  KEY `statements_of_account_reviewed_by_foreign` (`reviewed_by`),
  KEY `statements_of_account_status_tax_declaration_id_index` (`status`,`tax_declaration_id`),
  KEY `statements_of_account_revision_of_id_index` (`revision_of_id`),
  CONSTRAINT `statements_of_account_prepared_by_foreign` FOREIGN KEY (`prepared_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `statements_of_account_reviewed_by_foreign` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `statements_of_account_tax_declaration_id_foreign` FOREIGN KEY (`tax_declaration_id`) REFERENCES `tax_declarations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `statements_of_account_taxpayer_id_foreign` FOREIGN KEY (`taxpayer_id`) REFERENCES `taxpayers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statements_of_account`
--

LOCK TABLES `statements_of_account` WRITE;
/*!40000 ALTER TABLE `statements_of_account` DISABLE KEYS */;
INSERT INTO `statements_of_account` VALUES ('a2e6d8fd-74b7-4316-9dad-17b705cc27a1','SOA-SOA-2026-00001','a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2f04eb8-14c2-435f-8c79-4258c468dfcc',NULL,'Maria Santos','010-01-0001-000-00','TD-2026-0001','San Isidro','2026-10-04','2026-10-31',159975.00,159975.00,319950.00,105583.50,105583.50,425533.50,1,'Superseded','Initial Assessment & Billing Statement for Maria Santos','Verified and approved by Treasurer','a2e6d896-ab44-4d8c-9709-cffab9c0e141','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','2026-10-04 14:21:06','2026-10-04 14:21:06','2026-10-04 14:21:06','2026-10-04 14:21:06','2026-10-09 07:12:45'),('a2e6d8fd-929f-4482-8388-f50dbabdee03','SOA-SOA-2026-00002','a2e6ccb9-bdb6-45d8-bf79-2d51d76c9eb5',NULL,NULL,'Roberto Garcia','010-01-0001-000-00','TD-2026-0002','Tumaring','2026-10-04','2026-10-31',159975.00,159975.00,319950.00,105583.50,105583.50,425533.50,1,'Superseded','Billing statement awaiting Treasurer penalty review',NULL,'a2e6d896-ab44-4d8c-9709-cffab9c0e141',NULL,NULL,NULL,NULL,'2026-10-04 14:21:06','2026-10-04 14:38:56'),('a2e6df5d-496b-4899-969a-380b1598e4ae','SOA-2026-00003','a2e6ccb9-bdb6-45d8-bf79-2d51d76c9eb5',NULL,NULL,'Roberto Garcia','010-01-0001-000-00','TD-2026-0002','Tumaring','2026-10-04','2026-11-03',159975.00,159975.00,319950.00,105583.50,105583.50,425533.50,1,'Settled',NULL,'Approved by Municipal Treasurer','a2e6d896-ab44-4d8c-9709-cffab9c0e141','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','2026-10-04 14:43:19','2026-10-04 14:43:19','2026-10-04 14:43:19','2026-10-04 14:38:56','2026-10-04 14:47:06'),('a2efe7c2-1f15-4f93-886a-161d18f972f6','SOA-2026-00004','a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2f04eb8-14c2-435f-8c79-4258c468dfcc',NULL,'Maria Santos','010-01-0001-000-00','TD-2026-0001','San Isidro','2026-10-09','2026-10-31',13331.25,13331.25,26662.50,17597.25,17597.25,44259.75,1,'Settled','Initial Assessment & Billing Statement for Maria Santos','Verified and approved by Treasurer','a2e6d896-ab44-4d8c-9709-cffab9c0e141','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','2026-10-09 02:24:51','2026-10-09 02:24:51','2026-10-09 02:24:51','2026-10-09 02:24:51','2026-10-09 07:12:45');
/*!40000 ALTER TABLE `statements_of_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_bill_installments`
--

DROP TABLE IF EXISTS `tax_bill_installments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tax_bill_installments` (
  `id` char(36) NOT NULL,
  `tax_bill_id` char(36) NOT NULL,
  `quarter` tinyint(3) unsigned NOT NULL,
  `due_date` date NOT NULL,
  `basic_due` decimal(15,2) NOT NULL,
  `sef_due` decimal(15,2) NOT NULL,
  `total_due` decimal(15,2) NOT NULL,
  `basic_paid` decimal(15,2) NOT NULL DEFAULT 0.00,
  `sef_paid` decimal(15,2) NOT NULL DEFAULT 0.00,
  `penalty_paid` decimal(15,2) NOT NULL DEFAULT 0.00,
  `discount_granted` decimal(15,2) NOT NULL DEFAULT 0.00,
  `status` varchar(255) NOT NULL DEFAULT 'Unpaid',
  `paid_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tax_bill_installments_tax_bill_id_quarter_unique` (`tax_bill_id`,`quarter`),
  KEY `tax_bill_installments_status_due_date_index` (`status`,`due_date`),
  CONSTRAINT `tax_bill_installments_tax_bill_id_foreign` FOREIGN KEY (`tax_bill_id`) REFERENCES `tax_bills` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_bill_installments`
--

LOCK TABLES `tax_bill_installments` WRITE;
/*!40000 ALTER TABLE `tax_bill_installments` DISABLE KEYS */;
INSERT INTO `tax_bill_installments` VALUES ('a2e6d8d5-1836-4161-89af-16b3340813e5','a2e6d8d5-13ec-43ca-a998-8eb1c01d2f73',1,'2024-01-20',13331.25,13331.25,26662.50,13331.25,13331.25,35194.50,0.00,'Paid','2026-10-09 02:24:51','2026-10-04 14:20:40','2026-10-09 02:24:51'),('a2e6d8d5-192f-480b-98a7-2690fe00f080','a2e6d8d5-13ec-43ca-a998-8eb1c01d2f73',2,'2024-04-20',13331.25,13331.25,26662.50,13331.25,13331.25,15997.50,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:29:47'),('a2e6d8d5-199f-44af-bf01-5bd8769d01aa','a2e6d8d5-13ec-43ca-a998-8eb1c01d2f73',3,'2024-07-20',13331.25,13331.25,26662.50,13331.25,13331.25,14397.75,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:07:59'),('a2e6d8d5-1a9e-4ffb-802b-fa63600e73d4','a2e6d8d5-13ec-43ca-a998-8eb1c01d2f73',4,'2024-10-20',13331.25,13331.25,26662.50,13331.25,13331.25,12798.00,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:07:59'),('a2e6d8d5-21c8-46b4-b843-b4c70e216e57','a2e6d8d5-1fdd-42f7-8a14-57d2f6db1230',1,'2025-01-20',13331.25,13331.25,26662.50,13331.25,13331.25,11198.25,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:07:59'),('a2e6d8d5-221c-4f1f-9664-588669f5e9d7','a2e6d8d5-1fdd-42f7-8a14-57d2f6db1230',2,'2025-04-20',13331.25,13331.25,26662.50,13331.25,13331.25,9598.50,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:07:59'),('a2e6d8d5-226a-4ec2-bf38-5d64b8db01ae','a2e6d8d5-1fdd-42f7-8a14-57d2f6db1230',3,'2025-07-20',13331.25,13331.25,26662.50,13331.25,13331.25,7998.75,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:07:59'),('a2e6d8d5-22b7-4ce3-87ef-eb8773fb2c88','a2e6d8d5-1fdd-42f7-8a14-57d2f6db1230',4,'2025-10-20',13331.25,13331.25,26662.50,13331.25,13331.25,6399.00,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:07:59'),('a2e6d8d5-2802-4aae-a7cc-0955319e2d1d','a2e6d8d5-266f-43df-8728-5d7fac570d1d',1,'2026-01-20',13331.25,13331.25,26662.50,13331.25,13331.25,4799.25,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:07:59'),('a2e6d8d5-2891-4879-925a-f2fa6ce7b206','a2e6d8d5-266f-43df-8728-5d7fac570d1d',2,'2026-04-20',13331.25,13331.25,26662.50,13331.25,13331.25,3199.50,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:07:59'),('a2e6d8d5-28fd-4ecb-a283-c0704aca6606','a2e6d8d5-266f-43df-8728-5d7fac570d1d',3,'2026-07-20',13331.25,13331.25,26662.50,13331.25,13331.25,1599.75,0.00,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:07:59'),('a2e6d8d5-297d-416c-83e3-83e13c47b111','a2e6d8d5-266f-43df-8728-5d7fac570d1d',4,'2026-10-20',13331.25,13331.25,26662.50,13331.25,13331.25,0.00,2666.25,'Paid','2026-10-04 15:07:59','2026-10-04 14:20:40','2026-10-04 15:08:00'),('a2e6d8d5-30b6-4580-829f-4211ae622ba5','a2e6d8d5-2eaa-4b30-8ac6-28aac174ea42',1,'2024-01-20',13331.25,13331.25,26662.50,13331.25,13331.25,17597.25,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-3161-4a30-acc5-007179c15ee4','a2e6d8d5-2eaa-4b30-8ac6-28aac174ea42',2,'2024-04-20',13331.25,13331.25,26662.50,13331.25,13331.25,15997.50,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-32c5-4c60-8210-6ad9c07a7b15','a2e6d8d5-2eaa-4b30-8ac6-28aac174ea42',3,'2024-07-20',13331.25,13331.25,26662.50,13331.25,13331.25,14397.75,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-3348-478e-bef5-dfc2b69df9ca','a2e6d8d5-2eaa-4b30-8ac6-28aac174ea42',4,'2024-10-20',13331.25,13331.25,26662.50,13331.25,13331.25,12798.00,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-3a75-440e-af42-01f4f521d9a8','a2e6d8d5-380e-43d1-b6b3-517b1727e898',1,'2025-01-20',13331.25,13331.25,26662.50,13331.25,13331.25,11198.25,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-3b18-442d-aa94-596018df4f25','a2e6d8d5-380e-43d1-b6b3-517b1727e898',2,'2025-04-20',13331.25,13331.25,26662.50,13331.25,13331.25,9598.50,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-3bad-4e4d-87db-2a31c5cf6dd4','a2e6d8d5-380e-43d1-b6b3-517b1727e898',3,'2025-07-20',13331.25,13331.25,26662.50,13331.25,13331.25,7998.75,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-3c20-4a64-be34-6a23a23b489e','a2e6d8d5-380e-43d1-b6b3-517b1727e898',4,'2025-10-20',13331.25,13331.25,26662.50,13331.25,13331.25,6399.00,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-40c5-4abe-9cc6-4ee1e45b52bf','a2e6d8d5-3f4b-4a4f-8f38-f45d1f20f6e3',1,'2026-01-20',13331.25,13331.25,26662.50,13331.25,13331.25,4799.25,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-4116-44d5-9284-86d377fb9094','a2e6d8d5-3f4b-4a4f-8f38-f45d1f20f6e3',2,'2026-04-20',13331.25,13331.25,26662.50,13331.25,13331.25,3199.50,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-416d-4dc0-b154-33bf5bf14580','a2e6d8d5-3f4b-4a4f-8f38-f45d1f20f6e3',3,'2026-07-20',13331.25,13331.25,26662.50,13331.25,13331.25,1599.75,0.00,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-41db-43c9-b786-37f1bcde48fb','a2e6d8d5-3f4b-4a4f-8f38-f45d1f20f6e3',4,'2026-10-20',13331.25,13331.25,26662.50,13331.25,13331.25,0.00,2666.25,'Paid','2026-10-04 14:47:06','2026-10-04 14:20:40','2026-10-04 14:47:06');
/*!40000 ALTER TABLE `tax_bill_installments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_bills`
--

DROP TABLE IF EXISTS `tax_bills`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tax_bills` (
  `id` char(36) NOT NULL,
  `bill_no` varchar(255) NOT NULL,
  `tax_declaration_id` char(36) NOT NULL,
  `assessment_id` char(36) DEFAULT NULL,
  `taxpayer_id` char(36) DEFAULT NULL,
  `owner_name` varchar(255) NOT NULL,
  `pin` varchar(255) DEFAULT NULL,
  `arp_number` varchar(255) DEFAULT NULL,
  `td_number` varchar(255) NOT NULL,
  `barangay` varchar(255) NOT NULL,
  `taxable_year` smallint(5) unsigned NOT NULL,
  `assessed_value` decimal(15,2) NOT NULL,
  `basic_rate_pct` decimal(6,3) NOT NULL,
  `sef_rate_pct` decimal(6,3) NOT NULL,
  `basic_tax` decimal(15,2) NOT NULL,
  `sef_tax` decimal(15,2) NOT NULL,
  `total_tax` decimal(15,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Unpaid',
  `generated_by` char(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tax_bills_tax_declaration_id_taxable_year_unique` (`tax_declaration_id`,`taxable_year`),
  UNIQUE KEY `tax_bills_bill_no_unique` (`bill_no`),
  KEY `tax_bills_assessment_id_foreign` (`assessment_id`),
  KEY `tax_bills_taxpayer_id_foreign` (`taxpayer_id`),
  KEY `tax_bills_generated_by_foreign` (`generated_by`),
  KEY `tax_bills_status_taxable_year_index` (`status`,`taxable_year`),
  CONSTRAINT `tax_bills_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tax_bills_generated_by_foreign` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tax_bills_tax_declaration_id_foreign` FOREIGN KEY (`tax_declaration_id`) REFERENCES `tax_declarations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tax_bills_taxpayer_id_foreign` FOREIGN KEY (`taxpayer_id`) REFERENCES `taxpayers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_bills`
--

LOCK TABLES `tax_bills` WRITE;
/*!40000 ALTER TABLE `tax_bills` DISABLE KEYS */;
INSERT INTO `tax_bills` VALUES ('a2e6d8d5-13ec-43ca-a998-8eb1c01d2f73','BILL-BILL-2024-00001','a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2e6ccb9-99b8-41ca-af69-45f778bc0cca','a2f04eb8-14c2-435f-8c79-4258c468dfcc','Maria Santos','010-01-0001-000-00','010-01-0001','TD-2026-0001','San Isidro',2024,5332500.00,1.000,1.000,53325.00,53325.00,106650.00,'Paid','a2e6d896-ab44-4d8c-9709-cffab9c0e141','2026-10-04 14:20:40','2026-10-09 07:12:45'),('a2e6d8d5-1fdd-42f7-8a14-57d2f6db1230','BILL-BILL-2025-00001','a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2e6ccb9-99b8-41ca-af69-45f778bc0cca','a2f04eb8-14c2-435f-8c79-4258c468dfcc','Maria Santos','010-01-0001-000-00','010-01-0001','TD-2026-0001','San Isidro',2025,5332500.00,1.000,1.000,53325.00,53325.00,106650.00,'Paid','a2e6d896-ab44-4d8c-9709-cffab9c0e141','2026-10-04 14:20:40','2026-10-09 07:12:45'),('a2e6d8d5-266f-43df-8728-5d7fac570d1d','BILL-BILL-2026-00001','a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2e6ccb9-99b8-41ca-af69-45f778bc0cca','a2f04eb8-14c2-435f-8c79-4258c468dfcc','Maria Santos','010-01-0001-000-00','010-01-0001','TD-2026-0001','San Isidro',2026,5332500.00,1.000,1.000,53325.00,53325.00,106650.00,'Paid','a2e6d896-ab44-4d8c-9709-cffab9c0e141','2026-10-04 14:20:40','2026-10-09 07:12:45'),('a2e6d8d5-2eaa-4b30-8ac6-28aac174ea42','BILL-BILL-2024-00002','a2e6ccb9-bdb6-45d8-bf79-2d51d76c9eb5','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961',NULL,'Roberto Garcia','010-01-0001-000-00','010-01-0001','TD-2026-0002','Tumaring',2024,5332500.00,1.000,1.000,53325.00,53325.00,106650.00,'Paid','a2e6d896-ab44-4d8c-9709-cffab9c0e141','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-380e-43d1-b6b3-517b1727e898','BILL-BILL-2025-00002','a2e6ccb9-bdb6-45d8-bf79-2d51d76c9eb5','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961',NULL,'Roberto Garcia','010-01-0001-000-00','010-01-0001','TD-2026-0002','Tumaring',2025,5332500.00,1.000,1.000,53325.00,53325.00,106650.00,'Paid','a2e6d896-ab44-4d8c-9709-cffab9c0e141','2026-10-04 14:20:40','2026-10-04 14:47:06'),('a2e6d8d5-3f4b-4a4f-8f38-f45d1f20f6e3','BILL-BILL-2026-00002','a2e6ccb9-bdb6-45d8-bf79-2d51d76c9eb5','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961',NULL,'Roberto Garcia','010-01-0001-000-00','010-01-0001','TD-2026-0002','Tumaring',2026,5332500.00,1.000,1.000,53325.00,53325.00,106650.00,'Paid','a2e6d896-ab44-4d8c-9709-cffab9c0e141','2026-10-04 14:20:40','2026-10-04 14:47:06');
/*!40000 ALTER TABLE `tax_bills` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tax_declarations`
--

DROP TABLE IF EXISTS `tax_declarations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tax_declarations` (
  `id` char(36) NOT NULL,
  `assessment_id` char(36) NOT NULL,
  `td_number` varchar(255) NOT NULL,
  `previous_td_number` varchar(255) DEFAULT NULL,
  `owner_name` varchar(255) NOT NULL,
  `barangay` varchar(255) NOT NULL,
  `total_market_value` decimal(15,2) NOT NULL,
  `total_assessed_value` decimal(15,2) NOT NULL,
  `effectivity_date` date NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'Active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tax_declarations_assessment_id_unique` (`assessment_id`),
  UNIQUE KEY `tax_declarations_td_number_unique` (`td_number`),
  CONSTRAINT `tax_declarations_assessment_id_foreign` FOREIGN KEY (`assessment_id`) REFERENCES `assessments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tax_declarations`
--

LOCK TABLES `tax_declarations` WRITE;
/*!40000 ALTER TABLE `tax_declarations` DISABLE KEYS */;
INSERT INTO `tax_declarations` VALUES ('a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2e6ccb9-99b8-41ca-af69-45f778bc0cca','TD-2026-0001',NULL,'Maria Santos','San Isidro',10665000.00,5332500.00,'2026-10-04','Active','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2e6ccb9-bdb6-45d8-bf79-2d51d76c9eb5','a2e6ccb9-b2b1-4397-a2c6-2a5f284f9961','TD-2026-0002',NULL,'Roberto Garcia','Tumaring',10665000.00,5332500.00,'2026-10-04','Active','2026-10-04 13:46:49','2026-10-04 13:46:49');
/*!40000 ALTER TABLE `tax_declarations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taxpayer_notifications`
--

DROP TABLE IF EXISTS `taxpayer_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxpayer_notifications` (
  `id` char(36) NOT NULL,
  `taxpayer_id` char(36) DEFAULT NULL,
  `tax_declaration_id` char(36) DEFAULT NULL,
  `statement_of_account_id` char(36) DEFAULT NULL,
  `payment_id` char(36) DEFAULT NULL,
  `channel` varchar(255) NOT NULL DEFAULT 'in-app',
  `recipient_email` varchar(255) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `taxpayer_notifications_taxpayer_id_foreign` (`taxpayer_id`),
  KEY `taxpayer_notifications_tax_declaration_id_foreign` (`tax_declaration_id`),
  KEY `taxpayer_notifications_statement_of_account_id_index` (`statement_of_account_id`),
  KEY `taxpayer_notifications_payment_id_index` (`payment_id`),
  CONSTRAINT `taxpayer_notifications_tax_declaration_id_foreign` FOREIGN KEY (`tax_declaration_id`) REFERENCES `tax_declarations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `taxpayer_notifications_taxpayer_id_foreign` FOREIGN KEY (`taxpayer_id`) REFERENCES `taxpayers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taxpayer_notifications`
--

LOCK TABLES `taxpayer_notifications` WRITE;
/*!40000 ALTER TABLE `taxpayer_notifications` DISABLE KEYS */;
INSERT INTO `taxpayer_notifications` VALUES ('a2e6d8fd-7fc6-436b-99b5-9c8de3a43381',NULL,'a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2e6d8fd-74b7-4316-9dad-17b705cc27a1',NULL,'in-app/email',NULL,'Real Property Tax Statement of Account: SOA-SOA-2026-00001 (TD-2026-0001)','Dear Maria Santos,\n\nA Statement of Account (SOA No: SOA-SOA-2026-00001) has been issued for your property with Tax Declaration TD-2026-0001 in Barangay San Isidro.\n\nTotal Amount Due: PHP 425,533.50\nValid Until: October 31, 2026\n\nPlease proceed to the Municipal Treasurer\'s Office (Cashier) to settle your account.\n\nThank you,\nMunicipality of Magarao',NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6d8fd-8c36-42ce-9c57-c12add5f7af7',NULL,'a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6d8fd-855c-4f37-a4f5-c46c36a938df','in-app/email',NULL,'Official Receipt: OR-OR-2026-000001 - Payment Acknowledged','Dear Maria Santos,\n\nWe acknowledge receipt of your payment for Real Property Tax under Official Receipt No. OR-OR-2026-000001.\n\nAmount Paid: PHP 50,000.00\nPayment Date: October 04, 2026 10:21 PM\nPayment Method: Cash\nRemaining Balance: PHP 375,533.50\n\nThank you for paying your real property taxes on time.\n\nMunicipality of Magarao',NULL,'2026-10-04 14:21:06','2026-10-04 14:21:06'),('a2e6e0ee-f526-4e03-a7b4-0b88810c23cb',NULL,'a2e6ccb9-bdb6-45d8-bf79-2d51d76c9eb5','a2e6df5d-496b-4899-969a-380b1598e4ae',NULL,'in-app/email',NULL,'Real Property Tax Statement of Account: SOA-2026-00003 (TD-2026-0002)','Dear Roberto Garcia,\n\nA Statement of Account (SOA No: SOA-2026-00003) has been issued for your property with Tax Declaration TD-2026-0002 in Barangay Tumaring.\n\nTotal Amount Due: PHP 425,533.50\nValid Until: November 03, 2026\n\nPlease proceed to the Municipal Treasurer\'s Office (Cashier) to settle your account.\n\nThank you,\nMunicipality of Magarao',NULL,'2026-10-04 14:43:19','2026-10-04 14:43:19'),('a2e6e24a-5188-45da-b214-18f56cb0fcc8',NULL,'a2e6ccb9-bdb6-45d8-bf79-2d51d76c9eb5','a2e6df5d-496b-4899-969a-380b1598e4ae','a2e6e249-f565-4efe-ae8b-63337b3a3916','in-app/email',NULL,'Official Receipt: OR-2026-000002 - Payment Acknowledged','Dear Roberto Garcia,\n\nWe acknowledge receipt of your payment for Real Property Tax under Official Receipt No. OR-2026-000002.\n\nAmount Paid: PHP 422,867.25\nPayment Date: October 04, 2026 12:00 AM\nPayment Method: Cash\nRemaining Balance: PHP 0.00\n\nThank you for paying your real property taxes on time.\n\nMunicipality of Magarao',NULL,'2026-10-04 14:47:06','2026-10-04 14:47:06'),('a2e6e9c2-48a7-4511-b5d5-5a453fdd2b2b',NULL,'a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2e6d8fd-74b7-4316-9dad-17b705cc27a1','a2e6e9c2-1460-4ab3-8683-796a871ccccc','in-app/email',NULL,'Official Receipt: OR-2026-000003 - Payment Acknowledged','Dear Maria Santos,\n\nWe acknowledge receipt of your payment for Real Property Tax under Official Receipt No. OR-2026-000003.\n\nAmount Paid: PHP 396,204.75\nPayment Date: October 04, 2026 12:00 AM\nPayment Method: Cash\nRemaining Balance: PHP 0.00\n\nThank you for paying your real property taxes on time.\n\nMunicipality of Magarao',NULL,'2026-10-04 15:08:00','2026-10-04 15:08:00'),('a2efe7c2-28a9-42d2-8c51-51c84867eee1',NULL,'a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2efe7c2-1f15-4f93-886a-161d18f972f6',NULL,'in-app/email',NULL,'Real Property Tax Statement of Account: SOA-2026-00004 (TD-2026-0001)','Dear Maria Santos,\n\nA Statement of Account (SOA No: SOA-2026-00004) has been issued for your property with Tax Declaration TD-2026-0001 in Barangay San Isidro.\n\nTotal Amount Due: PHP 44,259.75\nValid Until: October 31, 2026\n\nPlease proceed to the Municipal Treasurer\'s Office (Cashier) to settle your account.\n\nThank you,\nMunicipality of Magarao',NULL,'2026-10-09 02:24:51','2026-10-09 02:24:51'),('a2efe7c2-3438-45e1-9564-8f81c900ae1b',NULL,'a2e6ccb9-a6f9-48d3-87d7-410fdef4d74d','a2efe7c2-1f15-4f93-886a-161d18f972f6','a2efe7c2-2df7-44b7-b277-24eab68e1fb5','in-app/email',NULL,'Official Receipt: OR-2026-000004 - Payment Acknowledged','Dear Maria Santos,\n\nWe acknowledge receipt of your payment for Real Property Tax under Official Receipt No. OR-2026-000004.\n\nAmount Paid: PHP 44,259.75\nPayment Date: October 09, 2026 10:24 AM\nPayment Method: Cash\nRemaining Balance: PHP 0.00\n\nThank you for paying your real property taxes on time.\n\nMunicipality of Magarao',NULL,'2026-10-09 02:24:51','2026-10-09 02:24:51');
/*!40000 ALTER TABLE `taxpayer_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `taxpayers`
--

DROP TABLE IF EXISTS `taxpayers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `taxpayers` (
  `id` char(36) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `tin` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `contact` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `taxpayers_tin_unique` (`tin`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `taxpayers`
--

LOCK TABLES `taxpayers` WRITE;
/*!40000 ALTER TABLE `taxpayers` DISABLE KEYS */;
INSERT INTO `taxpayers` VALUES ('a2e6ccb9-3faf-470f-997b-8704758114ac','Reyes','Pedro','Santos','111-222-333-444','Malobago, Magarao, Camarines Sur','+63 917 555 0101','pedro.reyes@example.com','2026-10-04 13:46:48','2026-10-04 13:46:48'),('a2f04eb8-14c2-435f-8c79-4258c468dfcc','Santos','Maria',NULL,'222-333-444-555','San Isidro, Magarao, Camarines Sur','+63 918 555 0202','taxpayer@magarao.gov','2026-10-09 07:12:45','2026-10-09 07:19:46');
/*!40000 ALTER TABLE `taxpayers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'info',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `action_url` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_notifications_user_id_is_read_index` (`user_id`,`is_read`),
  KEY `user_notifications_user_id_created_at_index` (`user_id`,`created_at`),
  CONSTRAINT `user_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
INSERT INTO `user_notifications` VALUES ('a2f06487-9a40-481c-a555-95fdff13d29a','a2e6d896-ab44-4d8c-9709-cffab9c0e141','bill_due','Time to Generate 2026 Tax Bills','Taxable Year 2026 is active. Ensure all active Tax Declarations have annual tax bills generated.','/revenue/bills',0,'2026-10-09 08:13:44','2026-10-09 08:13:44'),('a2f06487-a1d0-44b2-9dd4-69f762492d75','a2e6d896-ab44-4d8c-9709-cffab9c0e141','soa_approved','Treasurer Approved SOA','Treasurer Ramon Gomez approved Statement of Account for Maria Santos (TD-2026-0001). Ready for collection.','/revenue/soas',0,'2026-10-09 08:13:44','2026-10-09 08:13:44'),('a2f0744f-af0d-4aec-acd3-6e25dbd93caa','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','soa_pending','New SOA Pending Penalty Review','Revenue Clerk submitted SOA for Roberto Garcia (TD-2026-0002) with overdue penalties requiring your official approval.','/treasurer/penalty-approvals',0,'2026-10-09 08:57:52','2026-10-09 08:57:52'),('a2f0744f-b3e8-4809-848d-74f5914b2299','a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','system','Daily Collection Summary','Daily revenue collections are ready for review and reconciliation.','/treasurer/reports',0,'2026-10-09 08:57:52','2026-10-09 08:57:52'),('a2f07487-6703-45a6-810b-e3dcc1de1ff6','a2e6d897-c939-4d83-b452-1449a813e6a2','soa_issued','Statement of Account Available','Your official Statement of Account for property in San Isidro has been issued. View and settle at the Collection Desk.','/taxpayer/portal',1,'2026-10-09 08:58:28','2026-10-09 09:13:52'),('a2f07487-6aae-4193-bf06-f10c4d18f0b1','a2e6d897-c939-4d83-b452-1449a813e6a2','bill_due','Discount Notice for Early Payment','Pay your annual real property tax in full before the statutory deadline to avail of advance payment discounts.','/taxpayer/portal',1,'2026-10-09 08:58:28','2026-10-09 09:13:49'),('a2f0792c-b273-434c-9ca3-980780ef01d6','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','soa_issued','Active SOA Ready for Payment','Statement of Account for Maria Santos (TD-2026-0001) has been approved and issued. Ready for transaction at Collection Desk.','/cashier/desk',1,'2026-10-09 09:11:28','2026-10-09 09:11:36'),('a2f0792c-b83e-40ae-9fd6-81e646dc77f1','a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','system','Cancellation Policy Reminder','Remember to submit all Official Receipt void requests for Treasurer approval before close of business.','/cashier/receipts',1,'2026-10-09 09:11:28','2026-10-09 09:11:34'),('a2f07b2f-ffde-4e82-8368-8df1f03771f2','a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','system','Welcome to Magarao RPTMS','System operational. All municipal modules and audit logs active.','/admin/dashboard',1,'2026-10-09 09:17:05','2026-10-09 09:17:18'),('a2f09b89-7c98-4f25-bc14-d5761cb34532','a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','system','Assessments Awaiting Review','Property assessment drafts submitted by clerk are ready for authorization.','/assessor/applications',0,'2026-10-09 10:47:33','2026-10-09 10:47:33'),('a2f09c0f-a6bd-4643-9163-15a595c33e94','a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','system','New Property Application Queue','Applications submitted for appraisal and SMV unit value calculation.','/clerk/registrations',0,'2026-10-09 10:49:01','2026-10-09 10:49:01');
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `taxpayer_id` char(36) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_taxpayer_id_index` (`taxpayer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('a2e6ccb7-a3c7-4b98-bef3-33537f83a45b','clerk','maria@magarao.gov','$2y$12$FeyqiHwBpT0Pel21SGYKV.lgXuLKCh5RCtRHognNDuPOjhFn2oxwm','Maria Santos','Assessment Clerk',NULL,'active','2026-10-09 10:49:00',NULL,'2026-10-04 13:46:47','2026-10-09 10:49:00'),('a2e6ccb8-040f-4cd5-b2fe-a43a31555fed','assessor','juan@magarao.gov','$2y$12$sZ8.KTfGG5S3I.7SuV.xoeIV/G1SCDPCCs/oAHCQGzGxH0h0JRvrq','Juan Rodriguez','Municipal Assessor',NULL,'active','2026-10-09 10:47:32',NULL,'2026-10-04 13:46:47','2026-10-09 10:47:32'),('a2e6ccb8-5dbf-4bc9-a09f-994493c7252b','admin','admin@magarao.gov','$2y$12$FO7uBEsBqO3Fw4yYP8at1OMp29rHTN2FSLR69yZ5yQ9cF/folHUea','Admin User','Administrator',NULL,'active','2026-10-09 10:58:02',NULL,'2026-10-04 13:46:48','2026-10-09 10:58:02'),('a2e6ccb8-bf47-418f-8a5a-815ef48abc56','jsmith','john@magarao.gov','$2y$12$/AM2SkVG9NNcQslB6y/99.FBZtXISTTh5z43ZYLy4FnSHWh8Se4kW','John Smith','Assessment Clerk',NULL,'inactive','2026-10-08 07:17:32',NULL,'2026-10-04 13:46:48','2026-10-09 07:17:32'),('a2e6ccb9-1a73-44f2-a4bf-3fc9a01df128','sjohnson','sarah@magarao.gov','$2y$12$Eo6kPFfsv9O/yk3r0DjnKOYiNKU0iQhamursO5z0KPjyCJAgunAY6','Sarah Johnson','Assessment Clerk',NULL,'active','2026-10-08 07:17:33',NULL,'2026-10-04 13:46:48','2026-10-09 07:17:33'),('a2e6d896-ab44-4d8c-9709-cffab9c0e141','revenue','revenue@magarao.gov','$2y$12$xGX20PiepHvsh92oF2sIkOQra5ee3g1xueYXRNOWdBcEPx72S3Smm','Elena Reyes','Revenue Clerk',NULL,'active','2026-10-09 08:13:44',NULL,'2026-10-04 14:19:59','2026-10-09 08:13:44'),('a2e6d897-0ba3-4efb-a042-b605d5d8d1d1','treasurer','treasurer@magarao.gov','$2y$12$cCsLVAJOHuMlWbM8AQ9/ROJdkRVlZ7aHHinr.ETLw.N8A3bTmL.CC','Ramon Gomez','Treasurer',NULL,'active','2026-10-09 08:57:52',NULL,'2026-10-04 14:19:59','2026-10-09 08:57:52'),('a2e6d897-6bb1-46ca-8ed3-16a6c57b74a7','cashier','cashier@magarao.gov','$2y$12$dTFe50z8Jg.dvz6qasGVxu0WikTS8cRlvGrL54JLZwKrREyRuvmta','Patricia Diaz','Cashier',NULL,'active','2026-10-09 10:57:42',NULL,'2026-10-04 14:19:59','2026-10-09 10:57:42'),('a2e6d897-c939-4d83-b452-1449a813e6a2','taxpayer','taxpayer@magarao.gov','$2y$12$ygpzWvzSzqgVN1oehwOYpehWgE357dNfhzrXc.x/Q0pFtecrG3ad2','Maria Santos','Taxpayer','a2f04eb8-14c2-435f-8c79-4258c468dfcc','active','2026-10-09 09:13:36',NULL,'2026-10-04 14:20:00','2026-10-09 09:13:36');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-09 21:36:31
